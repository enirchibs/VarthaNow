/**
 * Cloudflare Worker / Pages Function News Publishing Pipeline
 * 
 * To deploy on Cloudflare Workers:
 * 1. Set environment variables in Cloudflare Dashboard:
 *    - GEMINI_API_KEY: Your Google Gemini API Key
 *    - SUPABASE_URL: Your Supabase Project URL
 *    - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (for database insertions)
 * 2. Setup a cron trigger (e.g., every 1 hour) in wrangler.toml or the Cloudflare dashboard.
 */

import { createClient } from "@supabase/supabase-js";

// --- TYPES ---
export interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface RssFeed {
  category: string;
  url: string;
  language: string;
}

interface ArticlePayload {
  title: string;
  summary: string;
  content: string;
  source_url: string;
  source_name: string;
  image_url: string;
  category: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  published_at: string;
}

interface GeminiResponse {
  title: string;
  summary: string;
  content: string;
  seo_title: string;
  seo_description: string;
  tags: string[];
}

// Configured news sources
const RSS_SOURCES: RssFeed[] = [
  { category: "politics", url: "https://news.google.com/rss/search?q=telugu+politics+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=tollywood+cinema+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=jobs+notifications&hl=te&gl=IN&ceid=IN:te", language: "te" }
];

export default {
  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    console.log(`[Scheduled Event] Starting News Ingestion Pipeline at ${new Date().toISOString()}`);
    ctx.waitUntil(runPipeline(env));
  },

  // Also support manual triggers via HTTP GET
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    console.log(`[HTTP Request] Starting Manual Pipeline Trigger`);
    ctx.waitUntil(runPipeline(env));
    return new Response("News pipeline execution triggered successfully in the background.", { status: 202 });
  }
};

async function runPipeline(env: Env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error("[Configuration Error] Missing environment variables. Pipeline aborted.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const source of RSS_SOURCES) {
    console.log(`\n[RSS Fetch] Fetching feed for Category: ${source.category.toUpperCase()}`);
    let items: { title: string; link: string; date: string }[] = [];

    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });

      if (!response.ok) {
        console.error(`[RSS Error] Failed to fetch feed ${source.url}: Status ${response.status}`);
        continue;
      }

      const xml = await response.text();
      items = parseGoogleNewsRss(xml).slice(0, 3); // Process top 3 items to optimize resources
      console.log(`[RSS Success] Found ${items.length} items in feed.`);
    } catch (err: any) {
      console.error(`[RSS Error] Error parsing RSS for ${source.category}: ${err.message}`);
      continue;
    }

    for (const item of items) {
      console.log(`\n--- Processing item: "${item.title.slice(0, 60)}..." ---`);

      try {
        // Step 1: Resolve original URL (Google News redirects)
        const resolvedUrl = await resolveRedirectUrl(item.link);
        console.log(`[URL Resolved] Original URL: ${resolvedUrl}`);

        // Step 2: Prevent duplicates (Check Supabase for source_url/source_article_url)
        const isDuplicate = await checkDuplicate(supabase, resolvedUrl);
        if (isDuplicate) {
          console.log(`[Skipped] Duplicate article. Already published: ${resolvedUrl}`);
          continue;
        }

        // Step 3: Extract full article text
        let articleText = "";
        let originalHtml = "";

        // Try direct HTML fetch first
        try {
          const htmlRes = await fetch(resolvedUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
          });
          if (htmlRes.ok) {
            originalHtml = await htmlRes.text();
            articleText = cleanHtmlBody(originalHtml);
          }
        } catch (e: any) {
          console.log(`[Direct Scraper Failed] Direct page fetch failed: ${e.message}`);
        }

        // Fallback to Jina Reader if direct text is too short or blocked
        if (articleText.length < 250) {
          console.log(`[Extraction Fallback] Content is short or blocked. Retrying using Jina AI Reader...`);
          try {
            const jinaRes = await fetch(`https://r.jina.ai/${resolvedUrl}`, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            if (jinaRes.ok) {
              const jinaText = await jinaRes.text();
              if (jinaText.length > articleText.length) {
                articleText = jinaText;
              }
            }
          } catch (e: any) {
            console.error(`[Jina Reader Failed] Jina fetch error: ${e.message}`);
          }
        }

        // Final content check - If still unsuccessful (no content), do not publish
        if (!articleText || articleText.length < 250) {
          console.warn(`[Pipeline Skipped] Failed to extract sufficient article text (Length: ${articleText.length} chars). No title-only articles allowed.`);
          continue;
        }

        console.log(`[Extraction Success] Extracted ${articleText.length} characters of clean text.`);

        // Step 4: Extract source logo and featured image candidate from the original HTML if available
        const sourceName = extractSourceName(item.title);
        const imageUrl = extractOgImage(originalHtml) || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800`; // Fallback news image

        // Step 5: Send content to Gemini to rewrite in original Telugu words
        console.log(`[Gemini Request] Sending text to Gemini 2.0 Flash for rewriting...`);
        const aiRewrite = await rewriteWithGemini(resolvedUrl, item.title, source.category, articleText, geminiKey);
        
        if (!aiRewrite) {
          console.error(`[Gemini Error] Rewrite content generation failed. Skipping.`);
          continue;
        }

        console.log(`[Gemini Success] Successfully generated article rewritten in Telugu.`);

        // Step 6: Save to Supabase
        console.log(`[Database Insert] Saving to Supabase...`);
        
        // Match both potential schemas (the requested simplified schema, and the active blog_posts table)
        const payload = {
          // Requested spec schema
          title: aiRewrite.title,
          summary: aiRewrite.summary,
          content: aiRewrite.content,
          source_url: resolvedUrl,
          source_name: sourceName,
          image_url: imageUrl,
          category: source.category,
          tags: aiRewrite.tags,
          seo_title: aiRewrite.seo_title,
          seo_description: aiRewrite.seo_description,
          published_at: new Date().toISOString(),

          // Active database schema (blog_posts compat fallbacks)
          slug: toSlug(aiRewrite.title),
          excerpt: aiRewrite.summary,
          meta_title: aiRewrite.seo_title,
          meta_description: aiRewrite.seo_description,
          og_image: imageUrl,
          author_name: sourceName,
          language: "te",
          published: true,
          source_article_url: resolvedUrl
        };

        const { error } = await supabase.from("blog_posts").insert(payload);

        if (error) {
          // If inserting into blog_posts fails because of schema mismatch, try inserting to news_articles table
          console.log(`[Database Info] Retrying insert into 'news_articles' table...`);
          const { error: retryError } = await supabase.from("news_articles").insert({
            title: payload.title,
            summary: payload.summary,
            content: payload.content,
            source_url: payload.source_url,
            source_name: payload.source_name,
            image_url: payload.image_url,
            category: payload.category,
            tags: payload.tags,
            seo_title: payload.seo_title,
            seo_description: payload.seo_description,
            published_at: payload.published_at
          });

          if (retryError) {
            console.error(`[Database Error] Insert failed for both tables: ${retryError.message}`);
          } else {
            console.log(`[Database Success] Inserted successfully to news_articles.`);
          }
        } else {
          console.log(`[Database Success] Inserted successfully to blog_posts.`);
        }

      } catch (err: any) {
        console.error(`[Pipeline Error] Unexpected error processing item: ${err.message}`);
      }
    }
  }
}

// --- HELPERS ---

function parseGoogleNewsRss(xml: string): { title: string; link: string; date: string }[] {
  const items: { title: string; link: string; date: string }[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const m of matches) {
    const itemContent = m[1];
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const dateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim().replace("<![CDATA[", "").replace("]]>", ""),
        link: linkMatch[1].trim(),
        date: dateMatch ? dateMatch[1].trim() : new Date().toISOString()
      });
    }
  }
  return items;
}

async function resolveRedirectUrl(googleUrl: string): Promise<string> {
  try {
    const response = await fetch(googleUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    return response.url || googleUrl;
  } catch {
    return googleUrl;
  }
}

async function checkDuplicate(supabase: any, url: string): Promise<boolean> {
  try {
    // Check both potential fields in active tables
    const { data: blogMatch } = await supabase
      .from("blog_posts")
      .select("id")
      .or(`source_article_url.eq."${url}",source_url.eq."${url}"`)
      .maybeSingle();

    if (blogMatch) return true;

    // Check fallback table
    const { data: articleMatch } = await supabase
      .from("news_articles")
      .select("id")
      .eq("source_url", url)
      .maybeSingle();

    return Boolean(articleMatch);
  } catch {
    return false;
  }
}

function cleanHtmlBody(html: string): string {
  const body = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, "")
    .replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, "")
    .replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, "")
    .replace(/<form[^>]*>([\s\S]*?)<\/form>/gi, "");

  const matches = body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  const paragraphs: string[] = [];
  for (const m of matches) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length > 40) {
      paragraphs.push(text);
    }
  }
  return paragraphs.join("\n\n");
}

function extractOgImage(html: string): string | null {
  if (!html) return null;
  let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (match && match[1]) {
    return match[1].trim().replace(/&amp;/g, "&");
  }
  return null;
}

function extractSourceName(rssTitle: string): string {
  const parts = rssTitle.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "Google News";
}

async function rewriteWithGemini(
  sourceUrl: string,
  rssTitle: string,
  category: string,
  sourceText: string,
  apiKey: string
): Promise<GeminiResponse | null> {
  const prompt = `You are a professional Telugu news editor.
Read the source article and rewrite it completely in original wording.

Rules:
- Preserve facts and accuracy.
- Do not copy sentences from the source.
- Generate a compelling Telugu headline.
- Generate a 40-60 word summary.
- Generate 2-3 news paragraphs.
- Target length: 250-400 words.
- Professional news style.
- SEO-friendly.
- Do not mention the source publication in the article body.

Return valid JSON only matching this schema:
{
  "title": "Compelling Telugu headline",
  "summary": "40-60 word Telugu summary of the news",
  "content": "Full 2-3 paragraph rewritten article body in Telugu",
  "seo_title": "SEO-friendly Telugu title tag",
  "seo_description": "SEO-friendly Telugu meta description",
  "tags": ["Array of 5-8 Telugu and English tags"]
}

Source Title: "${rssTitle}"
Category: "${category}"
Source URL: "${sourceUrl}"

SOURCE ARTICLE TEXT CONTENT:
"""
${sourceText}
"""`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error(`[Gemini API Error] Response status: ${response.status}`);
      return null;
    }

    const data: any = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const cleanedJson = textResponse.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleanedJson) as GeminiResponse;
  } catch (error: any) {
    console.error(`[Gemini Parsing Error] Failed to generate json: ${error.message}`);
    return null;
  }
}

function toSlug(title: string): string {
  const latin = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return latin || `telugu-news-${Math.floor(Math.random() * 1000000).toString(36)}`;
}
