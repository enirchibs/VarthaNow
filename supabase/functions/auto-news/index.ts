import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

type Category =
  | "andhra-pradesh"
  | "telangana"
  | "cinema"
  | "vizag"
  | "technology"
  | "jobs"
  | "cricket"
  | "politics";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: Category;
  language: "te" | "en" | "hi" | "ta" | "kn";
};

type AiArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  reading_time_min: number;
  image_prompt: string;
  featured: boolean;
};

const feeds: { category: Category; url: string; language: "te" | "en" | "hi" | "ta" | "kn" }[] = [
  // Telugu feeds
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+breaking&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=telugu+cinema+latest+trending&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "vizag", url: "https://news.google.com/rss/search?q=visakhapatnam+latest+news&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=jobs+careers+hiring&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "politics", url: "https://news.google.com/rss/search?q=politics+latest+trending&hl=te&gl=IN&ceid=IN:te", language: "te" }
];

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !serviceRole || !geminiKey) {
    return json({ ok: false, error: "Missing required environment variables." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false }
  });

  const result = {
    fetched: 0,
    inserted: 0,
    skipped: 0,
    errors: [] as string[]
  };

  // 1. Automatically clean up old news posts (older than 7 days) to keep only the latest and trending news.
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .lt("published_at", sevenDaysAgo.toISOString());
    if (deleteError) {
      result.errors.push(`Old news cleanup error: ${deleteError.message}`);
    }
  } catch (error) {
    result.errors.push(`Clean up catch error: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const feed of feeds) {
    try {
      const items = await fetchRss(feed.url, feed.category, feed.language);
      result.fetched += items.length;

      // Slice to top 3 newest articles to keep news highly fresh, dynamic, and budget-friendly.
      for (const item of items.slice(0, 3)) {
        const baseSlug = toSlug(item.title);
        const exists = await slugExists(supabase, baseSlug);
        if (exists) {
          result.skipped += 1;
          continue;
        }

        const ai = await rewriteWithGemini(item, geminiKey);
        const slug = await uniqueSlug(supabase, ai.slug || baseSlug);

        // Resolve original article URL and extract banner image metadata
        const resolvedUrl = await resolveUrl(item.link);
        const categoryFallbacks: Record<string, string> = {
          "politics": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60",
          "andhra-pradesh": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
          "telangana": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
          "national": "https://images.unsplash.com/photo-1532375811409-905115e3b5a9?w=800&auto=format&fit=crop&q=60",
          "international": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&auto=format&fit=crop&q=60",
          "business": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
          "sports": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
          "entertainment": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
          "cinema": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
          "technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
          "jobs": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
          "cricket": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
          "vizag": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60"
        };

        let chosenImageUrl = categoryFallbacks[item.category] || "/og-image.png";
        const scrapedImg = await fetchOgImage(resolvedUrl);
        if (scrapedImg) {
          const uploadedUrl = await uploadImageToStorage(supabase, scrapedImg, slug);
          if (uploadedUrl) {
            chosenImageUrl = uploadedUrl;
          }
        }

        const { error } = await supabase.from("blog_posts").insert({
          slug,
          title: ai.title,
          excerpt: ai.excerpt,
          content: ai.content,
          category: item.category,
          tags: ai.tags,
          meta_title: ai.meta_title,
          meta_description: ai.meta_description,
          og_image: chosenImageUrl,
          author_name: "VarthaNow AI Desk",
          language: item.language,
          published: true,
          featured: ai.featured || false,
          reading_time_min: ai.reading_time_min,
          published_at: new Date().toISOString()
        });

        if (error) {
          result.errors.push(`${item.title}: ${error.message}`);
          continue;
        }

        result.inserted += 1;
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return json({ ok: true, ...result });
});

async function fetchRss(url: string, category: Category, language: "te" | "en" | "hi" | "ta" | "kn"): Promise<RssItem[]> {
  const response = await fetch(url, {
    headers: { "User-Agent": "VarthaNowBot/1.0 (+https://varthanow.com)" }
  });
  if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);

  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (!doc) throw new Error("Failed to parse RSS XML");
  const items = [...doc.querySelectorAll("item")].map((item) => ({
    title: text(item, "title"),
    link: text(item, "link"),
    pubDate: text(item, "pubDate"),
    source: text(item, "source") || "Google News",
    category,
    language
  })).filter((item) => item.title && item.link);

  // 1. Sort feed items chronologically: newest first
  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // 2. Keep only articles published in the last 48 hours to ensure maximum freshness
  const cutoffTime = Date.now() - 48 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.pubDate).getTime() > cutoffTime);
}

const languageConfig = {
  te: { name: "Telugu", latest: "తాజా వార్త", conclusion: "ముగింపు", fallbackExcerpt: "తాజా అప్డేట్", fallbackContent: "మరిన్ని వివరాలు త్వరలో అందుబాటులోకి వస్తాయి.", newsLabel: "తెలుగు వార్తలు" },
  en: { name: "English", latest: "Latest News", conclusion: "Conclusion", fallbackExcerpt: "Latest update", fallbackContent: "More details will be updated soon.", newsLabel: "English News" },
  hi: { name: "Hindi", latest: "ताज़ा समाचार", conclusion: "निष्कर्ष", fallbackExcerpt: "नवीनतम अपडेट", fallbackContent: "अधिक जानकारी जल्द ही अपडेट की जाएगी।", newsLabel: "हिंदी समाचार" },
  ta: { name: "Tamil", latest: "சமீபத்திய செய்தி", conclusion: "முடிவுரை", fallbackExcerpt: "சமீபத்திய புதுப்பிப்பு", fallbackContent: "கூடுதல் விவரங்கள் விரைவில் புதுப்பிக்கப்படும்.", newsLabel: "தமிழ் செய்திகள்" },
  kn: { name: "Kannada", latest: "ಇತ್ತೀಚಿನ ಸುದ್ದಿ", conclusion: "ತೀರ್ಮಾನ", fallbackExcerpt: "ಇತ್ತೀಚಿನ ಅಪ್ಡೇಟ್", fallbackContent: "ಹೆಚ್ಚಿನ ವಿವರಗಳನ್ನು ಶೀಘ್ರದಲ್ಲೇ ನವೀಕರಿಸಲಾಗುವುದು.", newsLabel: "ಕನ್ನಡ ಸುದ್ದಿ" }
};

async function rewriteWithGemini(item: RssItem, apiKey: string): Promise<AiArticle> {
  const langInfo = languageConfig[item.language] || languageConfig.te;
  const prompt = `
You are VarthaNow, a professional ${langInfo.name} news editor. Rewrite the following Google News RSS item into an original, copyright-safe ${langInfo.name} SEO article.

Rules:
- Completely rewrite; do not copy source text.
- Use natural, professional, and engaging ${langInfo.name} with a human tone, and short readable paragraphs.
- Do not invent fake statistics.
- Include markdown headings, bullet points, FAQ, and conclusion.
- Optimize for ${langInfo.name} SEO.
- Return only valid JSON with keys:
slug, title, excerpt, content, tags, meta_title, meta_description, reading_time_min, image_prompt, featured.

Provide description for the keys:
- image_prompt: A highly descriptive, realistic, and cinematic prompt (2-3 sentences) in English for a text-to-image generator representing the news. If the category or news is about Vizag (Visakhapatnam), describe a scenic photograph of the Visakhapatnam sea corridor, R.K. Beach road overlooking the blue Bay of Bengal, palm trees, coastal highway, or Kailasagiri, with professional lighting. If the category or news is about Telangana, describe Hyderabad landmarks such as the Charminar, Tank Bund with the Hussainsagar lake, Birla Mandir, the new Secretariat building, or the Legislative Assembly, beautiful sunset, highly detailed. If the category or news is about Andhra Pradesh, describe Prakasam Barrage, Tirumala hills, or Amaravati administrative buildings. For other categories, describe a realistic, professional, editorial news photograph representing the event. Always specify 'no text, no logos, no watermarks, realistic photojournalism style'.
- featured: A boolean indicating if this represents a major, high-profile, breaking or highly trending news story of significant public interest.

RSS item:
Title: ${item.title}
Source: ${item.source}
URL for attribution only: ${item.link}
Published: ${item.pubDate}
Category: ${item.category}
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini failed: ${response.status}`);
  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = safeJson(textResponse) as Partial<AiArticle>;

  return {
    slug: toSlug(parsed.slug || item.title),
    title: parsed.title || item.title,
    excerpt: parsed.excerpt || `${langInfo.fallbackExcerpt}: ${item.title}`,
    content: parsed.content || `## ${langInfo.latest}\n\n${item.title}\n\n## ${langInfo.conclusion}\n\n${langInfo.fallbackContent}`,
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [item.category, langInfo.newsLabel],
    meta_title: parsed.meta_title || item.title,
    meta_description: parsed.meta_description || `${langInfo.latest}: ${item.title}`,
    reading_time_min: Number(parsed.reading_time_min || 3),
    image_prompt: parsed.image_prompt || `realistic professional editorial news photograph of ${item.title}, high detail, photojournalism style, no text`,
    featured: Boolean(parsed.featured || false)
  };
}

async function slugExists(supabase: ReturnType<typeof createClient>, slug: string) {
  const { data, error } = await supabase.from("blog_posts").select("slug").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function uniqueSlug(supabase: ReturnType<typeof createClient>, slug: string) {
  let value = toSlug(slug);
  let suffix = 1;
  while (await slugExists(supabase, value)) {
    suffix += 1;
    value = `${slug}-${suffix}`;
  }
  return value;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value.replace(/^```json\s*/i, "").replace(/```$/i, ""));
  } catch {
    return {};
  }
}

function text(parent: Element, selector: string) {
  return parent.querySelector(selector)?.textContent?.trim() ?? "";
}

function toSlug(value: string) {
  const latin = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return latin || `telugu-news-${stableHash(value)}`;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  };
}

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    
    // 1. og:image
    let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (match && match[1]) {
      let imgUrl = match[1].trim().replace(/&amp;/g, "&");
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
      return imgUrl;
    }
  } catch {}
  return null;
}

async function resolveUrl(googleUrl: string): Promise<string> {
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

async function uploadImageToStorage(supabase: any, imageUrl: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const fileName = `${slug.slice(0, 60)}-${Date.now()}.jpg`;
    const storagePath = `article-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error(`Storage upload error: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(storagePath);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Upload error:`, error);
    return null;
  }
}


