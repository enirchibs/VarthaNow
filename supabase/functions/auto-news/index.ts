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
  { category: "politics", url: "https://news.google.com/rss/search?q=politics+latest+trending&hl=te&gl=IN&ceid=IN:te", language: "te" },
  // English feeds
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+breaking&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=bollywood+tollywood+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "vizag", url: "https://news.google.com/rss/search?q=visakhapatnam+latest+news&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=careers+jobs+hiring&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "politics", url: "https://news.google.com/rss/search?q=indian+politics+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  // Hindi feeds
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+breaking&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=bollywood+cinema+latest+trending&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "vizag", url: "https://news.google.com/rss/search?q=vizag+latest+news&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=jobs+careers+hiring&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  { category: "politics", url: "https://news.google.com/rss/search?q=politics+latest+trending&hl=hi&gl=IN&ceid=IN:hi", language: "hi" },
  // Tamil feeds
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+breaking&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=cinema+latest+trending&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "vizag", url: "https://news.google.com/rss/search?q=visakhapatnam+latest+news&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=careers+jobs+hiring&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  { category: "politics", url: "https://news.google.com/rss/search?q=politics+latest+trending&hl=ta&gl=IN&ceid=IN:ta", language: "ta" },
  // Kannada feeds
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "telangana", url: "https://news.google.com/rss/search?q=telangana+latest+breaking&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=cinema+latest+trending&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "vizag", url: "https://news.google.com/rss/search?q=visakhapatnam+latest+news&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=careers+jobs+hiring&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=kn&gl=IN&ceid=IN:kn", language: "kn" },
  { category: "politics", url: "https://news.google.com/rss/search?q=politics+latest+trending&hl=kn&gl=IN&ceid=IN:kn", language: "kn" }
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

        const { error } = await supabase.from("blog_posts").insert({
          slug,
          title: ai.title,
          excerpt: ai.excerpt,
          content: ai.content,
          category: item.category,
          tags: ai.tags,
          meta_title: ai.meta_title,
          meta_description: ai.meta_description,
          og_image: ai.image_prompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(ai.image_prompt)}?width=1200&height=675&nologo=true&private=true` : null,
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
- image_prompt: A descriptive English prompt (2-3 sentences) for a text-to-image generator, describing a realistic, professional, editorial news photograph about this event. Specify clear visual subjects, professional framing, high detail, and explicitly specify 'no text, no logos, no watermarks'.
- featured: A boolean indicating if this represents a major, high-profile, breaking or highly trending news story of significant public interest.

RSS item:
Title: ${item.title}
Source: ${item.source}
URL for attribution only: ${item.link}
Published: ${item.pubDate}
Category: ${item.category}
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
