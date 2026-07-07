import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import * as fs from "fs";
import * as crypto from "crypto";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
// @ts-ignore
import postlightParser from "@postlight/parser";
import sharp from "sharp";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Production Telugu News Ingestion Pipeline v3.0
//  50+ Direct RSS Sources · WebP Images · 5-Layer Dedup · Quality Gate
//  pipeline_jobs Queue · No AI Dependency on Ingestion Path
// ═══════════════════════════════════════════════════════════════════

// Load environment variables
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  } else {
    const envText = fs.readFileSync(".env", "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && value) process.env[key] = value;
    }
  }
} catch {
  console.log("No .env file found, relying on shell env");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing required environment variables.");
  console.error("  SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
  console.error("  SERVICE_ROLE:", serviceRole ? "SET" : "MISSING");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});
const parser = new Parser({ timeout: 15000 });

// ─── Pipeline Stats ───────────────────────────────────────────────
const stats = {
  totalProcessed: 0,
  inserted: 0,
  skipped: 0,
  failed: 0,
  imagesUploaded: 0,
  imagesRejected: 0,
  jobsQueued: 0,
  startTime: Date.now()
};

// ═══════════════════════════════════════════════════════════════════
//  FEED SOURCES — 50+ Direct RSS Feeds by Category
//  directFeed=true skips Google redirect resolution (saves ~3s/article)
// ═══════════════════════════════════════════════════════════════════

interface FeedSource {
  url: string;
  category: string;
  priority: number; // 1=critical, 2=high, 3=medium, 4=low
  publisher: string;
  directFeed: boolean;
  language?: string;
}

const FEED_SOURCES: FeedSource[] = [
  // ── P1: Politics ────────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=రాజకీయాలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "politics", priority: 1, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed", category: "politics", priority: 1, publisher: "TV9 Telugu", directFeed: true },
  { url: "https://ntvtelugu.com/feed", category: "politics", priority: 1, publisher: "NTV Telugu", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/state/andhra-pradesh", category: "politics", priority: 1, publisher: "ETV Bharat", directFeed: true },
  { url: "https://telanganatoday.com/feed", category: "politics", priority: 1, publisher: "Telangana Today", directFeed: true },

  // ── P1: Breaking / National ──────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=breaking+news+telugu+when:6h&hl=te&gl=IN&ceid=IN:te", category: "national", priority: 1, publisher: "Google News", directFeed: false },
  { url: "https://www.andhrajyothy.com/rss.xml", category: "national", priority: 1, publisher: "Andhra Jyothy", directFeed: true },
  { url: "https://www.vaartha.com/feed", category: "national", priority: 1, publisher: "Vaartha", directFeed: true },
  { url: "https://www.abpdesam.com/rss.xml", category: "national", priority: 1, publisher: "ABP Desam", directFeed: true },
  { url: "https://10tv.in/feed", category: "national", priority: 1, publisher: "10TV", directFeed: true },

  // ── P2: Andhra Pradesh ──────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=ఆంధ్రప్రదేశ్+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "andhra-pradesh", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/state/andhra-pradesh", category: "andhra-pradesh", priority: 2, publisher: "ETV Bharat AP", directFeed: true },
  { url: "https://tv9telugu.com/feed/category/andhra-pradesh", category: "andhra-pradesh", priority: 2, publisher: "TV9 AP", directFeed: true },

  // ── P2: Telangana ───────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=తెలంగాణ+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "telangana", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://telanganatoday.com/feed/category/telangana", category: "telangana", priority: 2, publisher: "Telangana Today", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/state/telangana", category: "telangana", priority: 2, publisher: "ETV Bharat TS", directFeed: true },
  { url: "https://hmtvlive.com/feed", category: "telangana", priority: 2, publisher: "HMTV Live", directFeed: true },

  // ── P2: Cricket / Sports ────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=క్రికెట్+IPL+T20+when:24h&hl=te&gl=IN&ceid=IN:te", category: "cricket", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/sports", category: "cricket", priority: 2, publisher: "TV9 Sports", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/sports", category: "cricket", priority: 2, publisher: "ETV Sports", directFeed: true },

  // ── P2: Business ────────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=వ్యాపారం+మార్కెట్+when:24h&hl=te&gl=IN&ceid=IN:te", category: "business", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://telanganatoday.com/feed/category/business", category: "business", priority: 2, publisher: "Telangana Today Business", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/business", category: "business", priority: 2, publisher: "ETV Business", directFeed: true },

  // ── P3: Cinema ──────────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=సినిమా+టాలీవుడ్+when:24h&hl=te&gl=IN&ceid=IN:te", category: "cinema", priority: 3, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/entertainment", category: "cinema", priority: 3, publisher: "TV9 Entertainment", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/entertainment", category: "cinema", priority: 3, publisher: "ETV Entertainment", directFeed: true },
  { url: "https://ntvtelugu.com/feed/category/entertainment", category: "cinema", priority: 3, publisher: "NTV Entertainment", directFeed: true },

  // ── P3: Technology ──────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=సాంకేతిక+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "technology", priority: 3, publisher: "Google News", directFeed: false },
  { url: "https://telanganatoday.com/feed/category/technology", category: "technology", priority: 3, publisher: "Telangana Today Tech", directFeed: true },

  // ── P3: Jobs ────────────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=ఉద్యోగాలు+ప్రభుత్వ+when:48h&hl=te&gl=IN&ceid=IN:te", category: "jobs", priority: 3, publisher: "Google News Jobs", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/education", category: "jobs", priority: 3, publisher: "ETV Education", directFeed: true },

  // ── P3: Health ──────────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=ఆరోగ్య+వార్తలు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "health", priority: 3, publisher: "Google News Health", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/health-and-lifestyle", category: "health", priority: 3, publisher: "ETV Health", directFeed: true },

  // ── P3: Education ───────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=విద్య+పాఠశాల+విశ్వవిద్యాలయం+when:48h&hl=te&gl=IN&ceid=IN:te", category: "education", priority: 3, publisher: "Google News Education", directFeed: false },

  // ── P4: Devotional / Spiritual ──────────────────────────────────
  { url: "https://news.google.com/rss/search?q=ఆధ్యాత్మికం+భక్తి+when:48h&hl=te&gl=IN&ceid=IN:te", category: "devotional", priority: 4, publisher: "Google News Devotional", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/devotional", category: "devotional", priority: 4, publisher: "TV9 Devotional", directFeed: true },

  // ── P4: Agriculture ─────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=వ్యవసాయం+రైతులు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "agriculture", priority: 4, publisher: "Google News Agriculture", directFeed: false },

  // ── P4: Astrology ───────────────────────────────────────────────
  { url: "https://news.google.com/rss/search?q=జ్యోతిష్యం+రాశిఫలాలు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "astrology", priority: 4, publisher: "Google News Astrology", directFeed: false },
];

const ITEMS_PER_FEED = 8;

// ─── Category Placeholders ────────────────────────────────────────
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  "politics":        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60",
  "andhra-pradesh":  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
  "telangana":       "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
  "national":        "https://images.unsplash.com/photo-1532375811409-905115e3b5a9?w=800&auto=format&fit=crop&q=60",
  "international":   "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&auto=format&fit=crop&q=60",
  "business":        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
  "cricket":         "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
  "sports":          "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
  "cinema":          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
  "entertainment":   "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
  "technology":      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
  "jobs":            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
  "health":          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
  "education":       "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60",
  "devotional":      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60",
  "agriculture":     "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop&q=60",
  "astrology":       "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=60",
  "crime":           "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60",
  "weather":         "https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&auto=format&fit=crop&q=60",
  "lifestyle":       "https://images.unsplash.com/photo-1464979681340-bdd28a61699e?w=800&auto=format&fit=crop&q=60",
};

const BLOCKED_IMAGE_HOSTS = [
  "t.co", "bit.ly", "tinyurl.com", "instagram.com",
  "facebook.com", "fb.com", "twitter.com", "x.com",
  "whatsapp.com", "telegram.org"
];

// ─── Categories that should SKIP AI rewrite entirely ─────────────
const AI_SKIP_CATEGORIES = new Set([
  "weather", "stocks", "stock-prices", "gold-rates",
  "lottery", "astrology"
]);

// ─── Job priority mapping by category/score ───────────────────────
function getJobPriority(importanceScore: number, priority: number): number {
  if (importanceScore >= 90) return 5;
  if (importanceScore >= 70) return 15;
  if (importanceScore >= 50) return 30;
  if (priority === 1) return 20;
  if (priority === 2) return 40;
  if (priority === 3) return 60;
  return 80;
}

// ═══════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `news-${Date.now()}`;
}

function urlHash(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function contentHash(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

// ─── Known Domain Logo Mapping ────────────────────────────────────
const KNOWN_DOMAINS: Record<string, string> = {
  "eenadu": "eenadu.net", "sakshi": "sakshi.com",
  "andhrajyothy": "andhrajyothy.com", "tv9": "tv9telugu.com",
  "tv9 telugu": "tv9telugu.com", "ntv": "ntvtelugu.com",
  "hmtv": "hmtvlive.com", "10tv": "10tv.in",
  "v6 news": "v6news.tv", "abp desam": "abpdesam.com",
  "vaartha": "vaartha.com", "news18": "news18.com",
  "etv bharat": "etvbharat.com", "telangana today": "telanganatoday.com",
  "google news": "google.com", "bbc": "bbc.com",
  "ndtv": "ndtv.com", "ani": "aninews.in",
  "hmtv live": "hmtvlive.com", "hmtvlive": "hmtvlive.com",
};

function extractSource(itemTitle: string | undefined, itemSource: any, feedPublisher: string): { name: string; logoUrl: string } {
  let name = feedPublisher || "";

  if (itemSource) {
    const src = typeof itemSource === "string" ? itemSource : (itemSource.title || itemSource._ || "");
    if (src && src.toLowerCase() !== "google news") name = src;
  }

  if (!name && itemTitle) {
    const dashMatch = itemTitle.match(/[-–—]\s*([^\-–—]+)\s*$/);
    if (dashMatch) name = dashMatch[1].trim();
  }

  if (!name) return { name: "VaartaNow", logoUrl: "/vaartanow-logo.png" };

  const SKIP_NAMES = new Set([
    "vaartanow ai desk", "varthanow ai desk", "vaartanow news desk",
    "vaartanow", "google news", "google"
  ]);
  if (SKIP_NAMES.has(name.toLowerCase().trim())) {
    return { name: "VaartaNow", logoUrl: "/vaartanow-logo.png" };
  }

  let domain = name.toLowerCase();
  if (!domain.includes(".")) {
    const key = domain.replace(/[^a-z0-9 ]/g, "").trim();
    domain = KNOWN_DOMAINS[key] || KNOWN_DOMAINS[key.split(" ")[0]] || (key.replace(/\s+/g, "") + ".com");
  }
  return { name, logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64` };
}

// ═══════════════════════════════════════════════════════════════════
//  EXTRACTION QUALITY SCORER
// ═══════════════════════════════════════════════════════════════════

function scoreExtraction(text: string): number {
  let score = 0;
  const wordCount = text.trim().split(/\s+/).length;

  // Word count scoring
  if (wordCount >= 400) score += 50;
  else if (wordCount >= 200) score += 35;
  else if (wordCount >= 100) score += 20;
  else score += 5;

  // Telugu character presence (detects real content vs transliteration noise)
  const teluguChars = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const teluguRatio = teluguChars / Math.max(text.length, 1);
  if (teluguRatio >= 0.2) score += 30;
  else if (teluguRatio >= 0.05) score += 15;
  else if (teluguRatio > 0) score += 5;
  // English-only articles (still valid for business/tech categories)
  else score += 20;

  // Penalize spam indicators
  const spamKeywords = [
    "subscribe", "click here", "advertisement", "sponsored",
    "follow us", "join our", "download app", "install app"
  ];
  const textLower = text.toLowerCase();
  const spamCount = spamKeywords.filter(k => textLower.includes(k)).length;
  score -= spamCount * 5;

  // Penalize extremely repetitive content (copied navigation menus etc.)
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const totalWords = text.split(/\s+/).length;
  if (totalWords > 50 && uniqueWords / totalWords < 0.3) score -= 20;

  return Math.max(0, Math.min(100, score));
}

// ═══════════════════════════════════════════════════════════════════
//  AI NEWS IMPORTANCE SCORE (0-100)
// ═══════════════════════════════════════════════════════════════════

function calculateImportanceScore(
  title: string,
  category: string,
  publishedAt: string,
  feedPriority: number,
  duplicateCount: number
): number {
  let score = 20; // base

  // Category/Feed Priority
  if (feedPriority === 1) score += 35;
  else if (feedPriority === 2) score += 22;
  else if (feedPriority === 3) score += 10;
  else score += 3;

  // Syndication — same story covered by multiple publishers
  score += Math.min(20, duplicateCount * 5);

  // High-impact Telugu keywords
  const criticalKeywords = [
    "చంద్రబాబు", "రేవంత్", "జగన్", "పవన్", "కళ్యాణ్", "మోదీ", "రాహుల్",
    "ముఖ్యమంత్రి", "సీఎం", "CM", "ప్రధాని", "పీఎం", "PM",
    "అసెంబ్లీ", "పార్లమెంట్", "కోర్టు", "హైకోర్టు", "సుప్రీంకోర్టు",
    "ప్రమాదం", "మరణాలు", "తుఫాను", "వరద", "భూకంపం",
    "IPL", "T20", "World Cup", "బంగారం", "పెట్రోల్", "డీజిల్",
    "election", "Elections", "ఎన్నికలు", "బడ్జెట్", "Budget"
  ];
  const titleLower = title.toLowerCase();
  let kw = 0;
  for (const k of criticalKeywords) {
    if (titleLower.includes(k.toLowerCase())) kw++;
  }
  score += Math.min(25, kw * 8);

  // Freshness
  try {
    const ageMins = (Date.now() - new Date(publishedAt).getTime()) / 60000;
    if (ageMins < 30)  score += 20; // Very breaking
    else if (ageMins < 60)  score += 15;
    else if (ageMins < 180) score += 8;
    else if (ageMins < 360) score += 3;
  } catch {}

  return Math.min(100, Math.max(0, score));
}

// ═══════════════════════════════════════════════════════════════════
//  5-LAYER DEDUPLICATION ENGINE
// ═══════════════════════════════════════════════════════════════════

interface DedupResult {
  isDuplicate: boolean;
  reason: string;
}

async function checkDuplicate(
  originalUrl: string,
  resolvedUrl: string,
  slug: string,
  hash: string,
  title: string
): Promise<DedupResult> {

  // Layer 1: Slug match
  const { data: bySlug } = await supabase
    .from("blog_posts").select("slug")
    .eq("slug", slug).maybeSingle();
  if (bySlug) return { isDuplicate: true, reason: `slug: ${slug}` };

  // Layer 2: URL exact match (original + resolved)
  const urlOrFilter = `source_article_url.eq.${originalUrl},source_article_url.eq.${resolvedUrl},source_url.eq.${originalUrl},source_url.eq.${resolvedUrl}`;
  const { data: byUrl } = await supabase
    .from("blog_posts").select("slug")
    .or(urlOrFilter).maybeSingle();
  if (byUrl) return { isDuplicate: true, reason: `url match` };

  // Layer 3: Content hash (same URL → same hash)
  const { data: byHash } = await supabase
    .from("blog_posts").select("slug")
    .eq("content_hash", hash).maybeSingle();
  if (byHash) return { isDuplicate: true, reason: `content_hash: ${hash}` };

  // Layer 4: Title trigram similarity (cross-session, last 24h)
  try {
    const { data: similar } = await supabase.rpc("find_similar_title", {
      q_title: title,
      threshold: 0.72
    });
    if (similar && similar.length > 0) {
      return { isDuplicate: true, reason: `title similarity: "${similar[0].title.slice(0, 50)}"` };
    }
  } catch {
    // pg_trgm function may not be deployed yet — skip gracefully
  }

  // Layer 5: Publisher + published_at within 6 hours (same story, different slug)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  try {
    const titleWords = title.split(/\s+/).filter(w => w.length > 4).slice(0, 4).join(" ");
    if (titleWords.length > 8) {
      const { data: recent } = await supabase
        .from("blog_posts").select("slug")
        .ilike("title", `%${titleWords}%`)
        .gte("published_at", sixHoursAgo)
        .limit(1);
      if (recent && recent.length > 0) {
        return { isDuplicate: true, reason: `recent title match: "${titleWords}"` };
      }
    }
  } catch {}

  return { isDuplicate: false, reason: "" };
}

// ═══════════════════════════════════════════════════════════════════
//  URL REDIRECT RESOLVER (Google News → Original Publisher)
// ═══════════════════════════════════════════════════════════════════

async function resolveUrl(googleUrl: string): Promise<string> {
  // Direct feed URLs don't need resolution
  if (!googleUrl.includes("news.google.com")) return googleUrl;

  try {
    const response = await fetch(googleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) return googleUrl;
    const html = await response.text();

    const match = html.match(/<c-wiz[^>]*data-p=["']([^"']+)["']/i);
    if (!match) return googleUrl;

    let dataP = decodeHtmlEntities(match[1]);
    const cleanedJson = dataP.replace(/%\.@\./g, '["garturlreq",');
    const obj = JSON.parse(cleanedJson);
    const processedObj = [...obj.slice(0, -6), ...obj.slice(-2)];

    const postBody = new URLSearchParams({
      "f.req": JSON.stringify([[["Fbv4je", JSON.stringify(processedObj), null, "generic"]]])
    });

    const postResponse = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://news.google.com/"
      },
      body: postBody.toString(),
      signal: AbortSignal.timeout(10_000)
    });

    if (!postResponse.ok) return googleUrl;
    const resText = await postResponse.text();
    const jsonStr = resText.replace(")]}'\\n\\n", "");
    const parsed = JSON.parse(jsonStr);
    const innerArray = JSON.parse(parsed[0][2]);
    return innerArray[1] || googleUrl;
  } catch {
    return googleUrl;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  ARTICLE EXTRACTION (4 methods + quality scoring)
// ═══════════════════════════════════════════════════════════════════

async function extractFullArticleContent(url: string, html: string): Promise<{ text: string; qualityScore: number }> {
  const clean = (raw: string): string => raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/advertisement|sponsored content|follow us on/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000); // 6000 chars gives AI enough context without blowing token budget

  let bestText = "";
  let bestScore = 0;

  // Method 1: Mozilla Readability
  if (html) {
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article?.textContent && article.textContent.trim().length >= 100) {
        const text = clean(article.textContent);
        const score = scoreExtraction(text);
        if (score > bestScore) { bestText = text; bestScore = score; }
        if (bestScore >= 70) {
          console.log(`  ✅ [Extraction] Readability: ${text.length} chars, quality=${score}`);
          return { text: bestText, qualityScore: bestScore };
        }
      }
    } catch {}
  }

  // Method 2: Firecrawl
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (firecrawlKey) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${firecrawlKey}` },
        body: JSON.stringify({ url, formats: ["markdown"] }),
        signal: AbortSignal.timeout(15_000)
      });
      if (res.ok) {
        const json: any = await res.json();
        const raw = json?.data?.markdown || json?.data?.content || "";
        if (raw.trim().length >= 100) {
          const text = clean(raw);
          const score = scoreExtraction(text);
          if (score > bestScore) { bestText = text; bestScore = score; }
          if (bestScore >= 70) return { text: bestText, qualityScore: bestScore };
        }
      }
    } catch {}
  }

  // Method 3: Jina AI Reader
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0" },
      signal: AbortSignal.timeout(15_000)
    });
    if (jinaRes.ok) {
      const raw = await jinaRes.text();
      if (raw.trim().length >= 100) {
        const text = clean(raw);
        const score = scoreExtraction(text);
        if (score > bestScore) { bestText = text; bestScore = score; }
        if (bestScore >= 70) return { text: bestText, qualityScore: bestScore };
      }
    }
  } catch {}

  // Method 4: Mercury Parser
  try {
    const result = await postlightParser.parse(url, { html });
    if (result?.textContent && result.textContent.trim().length >= 100) {
      const text = clean(result.textContent);
      const score = scoreExtraction(text);
      if (score > bestScore) { bestText = text; bestScore = score; }
    }
  } catch {}

  // Method 5: Raw paragraph fallback
  if (html && bestScore < 30) {
    const pMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    const paragraphs: string[] = [];
    for (const m of pMatches) {
      const pText = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (pText.length > 40) paragraphs.push(pText);
    }
    if (paragraphs.length > 0) {
      const text = clean(paragraphs.join("\n\n"));
      const score = scoreExtraction(text);
      if (score > bestScore) { bestText = text; bestScore = score; }
    }
  }

  console.log(`  ℹ️  [Extraction] Best method score: ${bestScore}, length: ${bestText.length}`);
  return { text: bestText, qualityScore: bestScore };
}

// ═══════════════════════════════════════════════════════════════════
//  IMAGE EXTRACTION
// ═══════════════════════════════════════════════════════════════════

function extractImagesFromHtml(html: string): string[] {
  const images: string[] = [];
  try {
    // og:image
    let m = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (m?.[1]) images.push(normalizeImageUrl(m[1]));

    // twitter:image
    m = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (m?.[1]) images.push(normalizeImageUrl(m[1]));

    // JSON-LD
    const ldMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (ldMatch?.[1]) {
      try {
        const ld = JSON.parse(ldMatch[1]);
        const ldImage = ld.image?.url || ld.image?.[0]?.url || ld.image?.[0] || (typeof ld.image === "string" ? ld.image : null);
        if (ldImage) images.push(normalizeImageUrl(ldImage));
      } catch {}
    }

    // img tags (filter out logos, icons, tracking pixels)
    const imgMatches = html.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi);
    for (const im of imgMatches) {
      const src = im[1];
      if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("avatar")
          && !src.includes("1x1") && !src.includes("pixel") && !src.endsWith(".svg")
          && !src.endsWith(".gif") && src.startsWith("http")) {
        images.push(normalizeImageUrl(src));
      }
    }
  } catch {}
  return [...new Set(images)].slice(0, 8);
}

function normalizeImageUrl(url: string): string {
  let c = url.trim().replace(/&amp;/g, "&");
  if (c.startsWith("//")) c = "https:" + c;
  return c;
}

async function fetchWikimediaImage(category: string, title: string): Promise<string | null> {
  try {
    // Extract meaningful keywords from Telugu title for better Wikimedia results
    const englishWords = title.match(/[A-Za-z][a-z]{2,}/g) || [];
    const importantEnglish = englishWords.filter(w =>
      !["the", "and", "for", "from", "with", "this", "that", "will", "are", "was"].includes(w.toLowerCase())
    ).slice(0, 3);

    const categoryKeywords: Record<string, string> = {
      "politics": "Indian politics parliament",
      "andhra-pradesh": "Andhra Pradesh India",
      "telangana": "Telangana Hyderabad India",
      "cricket": "cricket India match",
      "business": "India business economy",
      "cinema": "Tollywood Telugu cinema",
      "technology": "technology India",
      "health": "health medical India",
      "education": "education India university",
      "agriculture": "agriculture farmer India",
      "national": "India news",
    };

    const baseQuery = importantEnglish.length > 0
      ? importantEnglish.join(" ") + " India"
      : (categoryKeywords[category] || `${category} India`);

    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(baseQuery)}&srnamespace=6&format=json&origin=*&srlimit=3`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();

    for (const result of (data.query?.search || [])) {
      const fileUrlRes = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=imageinfo&iiprop=url|size&format=json&origin=*`,
        { signal: AbortSignal.timeout(5000) }
      );
      const fileData = await fileUrlRes.json();
      const pages = fileData.query?.pages;
      const page = Object.values(pages || {})[0] as any;
      const imgUrl = page?.imageinfo?.[0]?.url;
      const width = page?.imageinfo?.[0]?.width || 0;
      // Only use images wider than 400px
      if (imgUrl && width >= 400) return imgUrl;
    }
  } catch {}
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  IMAGE UPLOAD — WebP conversion via Sharp + Supabase Storage
// ═══════════════════════════════════════════════════════════════════

async function uploadImageToStorage(
  imageUrl: string,
  slug: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(20_000)
    });
    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    if (rawBuffer.length < 5000) {
      console.log("    ❌ Image too small (<5KB), skipping");
      return null;
    }

    // Convert to WebP with resize — reduces file size by 60-80%
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(rawBuffer)
        .resize(900, 500, { fit: "cover", position: "attention" })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      console.log(`    🖼️  WebP conversion: ${rawBuffer.length} → ${webpBuffer.length} bytes (${Math.round((1 - webpBuffer.length / rawBuffer.length) * 100)}% smaller)`);
    } catch (sharpErr: any) {
      console.warn(`    ⚠️  Sharp failed (${sharpErr.message}), uploading original`);
      webpBuffer = rawBuffer;
    }

    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const fileName = `${slug.slice(0, 55)}-${Date.now()}.webp`;
    const storagePath = `${datePath}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000", // 1 year CDN cache
        upsert: false
      });

    if (uploadError) {
      console.error(`    ❌ Storage upload error: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(storagePath);
    stats.imagesUploaded++;
    console.log(`    ✅ Image stored as WebP: ${storagePath}`);
    return { publicUrl: urlData.publicUrl, storagePath };
  } catch (err: any) {
    console.error(`    ❌ Upload error: ${err.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  FULL IMAGE PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function runImagePipeline(
  articleUrl: string,
  enclosureUrl: string | null,
  category: string,
  slug: string,
  articleTitle: string,
  articleHtml: string
): Promise<{ imageUrl: string; storagePath: string | null }> {
  const fallback = { imageUrl: CATEGORY_PLACEHOLDERS[category] || "/og-image.png", storagePath: null };

  // Build candidate list (priority ordered)
  const candidates: string[] = [];

  // 1. RSS enclosure image
  if (enclosureUrl && !BLOCKED_IMAGE_HOSTS.some(h => enclosureUrl.includes(h))) {
    candidates.push(enclosureUrl);
  }

  // 2. OG/Twitter/JSON-LD images from page HTML
  if (articleHtml) {
    const extracted = extractImagesFromHtml(articleHtml);
    candidates.push(...extracted.filter(u => !BLOCKED_IMAGE_HOSTS.some(h => u.includes(h))));
  }

  if (candidates.length === 0) {
    console.log(`  🔍 No RSS/OG images. Querying Wikimedia Commons...`);
    const wiki = await fetchWikimediaImage(category, articleTitle);
    if (wiki) candidates.push(wiki);
  }

  if (candidates.length === 0) {
    console.log(`  ⚠️  No images found. Using category placeholder.`);
    return fallback;
  }

  // Try each candidate — upload the first that passes size check
  for (let i = 0; i < Math.min(candidates.length, 4); i++) {
    const candidate = candidates[i];
    if (!candidate.startsWith("http")) continue;

    // HEAD check for image type and size
    try {
      const headRes = await fetch(candidate, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0" },
        signal: AbortSignal.timeout(6_000)
      });
      if (!headRes.ok) continue;
      const ct = headRes.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) continue;
      const cl = parseInt(headRes.headers.get("content-length") || "0", 10);
      if (cl > 0 && cl < 4000) continue; // too small
    } catch { continue; }

    const uploaded = await uploadImageToStorage(candidate, slug);
    if (uploaded) {
      return { imageUrl: uploaded.publicUrl, storagePath: uploaded.storagePath };
    }
  }

  console.log(`  ⚠️  All image candidates failed. Using category placeholder.`);

  stats.imagesRejected++;
  return fallback;
}

// ═══════════════════════════════════════════════════════════════════
//  PIPELINE JOBS CREATION
// ═══════════════════════════════════════════════════════════════════

async function createPipelineJobs(
  slug: string,
  importanceScore: number,
  feedPriority: number,
  wordCount: number,
  category: string,
  skipAi: boolean
): Promise<void> {
  const jobPriority = getJobPriority(importanceScore, feedPriority);
  const jobs: Array<{ post_slug: string; job_type: string; priority: number; payload: any }> = [];

  if (!skipAi && wordCount >= 200) {
    jobs.push({ post_slug: slug, job_type: "rewrite", priority: jobPriority, payload: { word_count: wordCount, category } });
    jobs.push({ post_slug: slug, job_type: "seo", priority: jobPriority + 5, payload: { category } });
    jobs.push({ post_slug: slug, job_type: "tags", priority: jobPriority + 10, payload: { category } });
    jobs.push({ post_slug: slug, job_type: "summary", priority: jobPriority + 15, payload: { category } });
  }

  // Social post for high-importance articles
  if (importanceScore >= 60) {
    jobs.push({ post_slug: slug, job_type: "social", priority: jobPriority + 20, payload: { platform: "telegram" } });
  }

  // Sitemap ping for breaking/critical content
  if (importanceScore >= 80) {
    jobs.push({ post_slug: slug, job_type: "sitemap", priority: 5, payload: { ping: true } });
  }

  if (jobs.length > 0) {
    const { error } = await supabase.from("pipeline_jobs").insert(jobs);
    if (error) {
      console.warn(`  ⚠️  Failed to create pipeline jobs: ${error.message}`);
    } else {
      stats.jobsQueued += jobs.length;
      console.log(`  📋 Queued ${jobs.length} pipeline jobs (priority=${jobPriority})`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN INGESTION PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function run() {
  console.log("═".repeat(70));
  console.log("📡  VaartaNow Telugu News Ingestion Pipeline v3.0 — STARTED");
  console.log(`    ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);

  // Parse CLI args
  const catIdx = process.argv.indexOf("--category");
  const targetCategory = catIdx !== -1 ? process.argv[catIdx + 1] : null;
  const priorityIdx = process.argv.indexOf("--priority");
  const targetPriority = priorityIdx !== -1 ? parseInt(process.argv[priorityIdx + 1]) : null;

  let feedsToProcess = FEED_SOURCES;
  if (targetCategory) {
    feedsToProcess = FEED_SOURCES.filter(f => f.category.toLowerCase() === targetCategory.toLowerCase());
    console.log(`🎯 Category filter: "${targetCategory}" → ${feedsToProcess.length} feeds`);
  } else if (targetPriority) {
    feedsToProcess = FEED_SOURCES.filter(f => f.priority === targetPriority);
    console.log(`🎯 Priority filter: P${targetPriority} → ${feedsToProcess.length} feeds`);
  }

  console.log(`📋 Processing ${feedsToProcess.length} feeds × up to ${ITEMS_PER_FEED} items`);
  console.log("═".repeat(70));

  for (const feed of feedsToProcess) {
    try {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`📡 [P${feed.priority}][${feed.category.toUpperCase()}] ${feed.publisher}`);
      console.log(`   ${feed.directFeed ? "✅ Direct Feed" : "🔄 Google News"}: ${feed.url.slice(0, 80)}`);

      let rssItems: any[] = [];
      try {
        const rss = await parser.parseURL(feed.url);
        rssItems = (rss.items || []).slice(0, ITEMS_PER_FEED);
        console.log(`   Found ${rssItems.length} items`);
      } catch (rssErr: any) {
        console.error(`   ❌ RSS fetch failed: ${rssErr.message}`);
        continue;
      }

      for (const item of rssItems) {
        if (!item.title || !item.link) continue;
        stats.totalProcessed++;

        const baseSlug = toSlug(item.title);
        const hash = urlHash(item.link);

        console.log(`\n  ┌─ "${item.title.slice(0, 65)}"`);

        // Basic content filter
        const titleLower = item.title.toLowerCase();
        if (titleLower.includes("advertisement") || titleLower.includes("ప్రకటన")) {
          console.log(`  └─ ⏭ Skipped (advertisement)`);
          stats.skipped++;
          continue;
        }

        // ── 5-LAYER DEDUP ───────────────────────────────────────
        const originalUrl = item.link;
        const dedup = await checkDuplicate(originalUrl, originalUrl, baseSlug, hash, item.title);
        if (dedup.isDuplicate) {
          console.log(`  └─ ⏭ Duplicate (${dedup.reason})`);
          stats.skipped++;
          continue;
        }

        try {
          // ── RESOLVE URL ─────────────────────────────────────
          let resolvedUrl = originalUrl;
          if (!feed.directFeed) {
            console.log(`  🔗 Resolving Google redirect...`);
            resolvedUrl = await resolveUrl(originalUrl);
            console.log(`  🔗 → ${resolvedUrl.slice(0, 80)}`);

            // Check dedup again on resolved URL
            if (resolvedUrl !== originalUrl) {
              const dedupResolved = await checkDuplicate(originalUrl, resolvedUrl, baseSlug, hash, item.title);
              if (dedupResolved.isDuplicate) {
                console.log(`  └─ ⏭ Duplicate resolved URL (${dedupResolved.reason})`);
                stats.skipped++;
                continue;
              }
            }
          } else {
            resolvedUrl = originalUrl; // Direct feeds need no resolution
          }

          // ── RSS-ONLY METADATA (no scraping) ────────────────
          // We use only what the RSS feed provides: title, snippet, link.
          // The AI will later write an ORIGINAL article about this topic.
          // We never store or republish the publisher's article text.
          const rssSnippet = (
            item.contentSnippet ||
            item.content?.replace(/<[^>]+>/g, "") ||
            ""
          ).trim().slice(0, 500); // RSS feeds legally provide this excerpt

          const wordCount = rssSnippet.split(/\s+/).filter(Boolean).length;
          const extractionScore = rssSnippet.length > 80 ? 60 : 30;

          console.log(`  📋 RSS snippet: ${wordCount} words from feed`);
          console.log(`  🔗 Original source: ${resolvedUrl.slice(0, 80)}`);

          // ── IMAGE PIPELINE ────────────────────────────────
          // OG images are publicly shared by publishers for link previews.
          // We fetch the HTML only for OG/Twitter image tags — not article text.
          let articleHtml = "";
          try {
            const headRes = await fetch(resolvedUrl, {
              method: "GET",
              headers: { "User-Agent": "Mozilla/5.0 (compatible; VaartaNowBot/1.0; +https://vaartanow.com)" },
              signal: AbortSignal.timeout(10_000)
            });
            if (headRes.ok) {
              const rawHtml = await headRes.text();
              // Only keep the <head> section — no article body text stored
              const headEnd = rawHtml.toLowerCase().indexOf("</head>");
              articleHtml = headEnd > 0 ? rawHtml.slice(0, headEnd + 7) : rawHtml.slice(0, 3000);
            }
          } catch {}

          const { name: sourceName, logoUrl: sourceLogoUrl } = extractSource(item.title, (item as any).source, feed.publisher);
          const imageResult = await runImagePipeline(
            resolvedUrl,
            item.enclosure?.url || null,
            feed.category,
            baseSlug,
            item.title,
            articleHtml
          );

          // ── IMPORTANCE SCORE ──────────────────────────────
          const publishedAtStr = item.isoDate || new Date().toISOString();
          const importanceScore = calculateImportanceScore(
            item.title, feed.category, publishedAtStr, feed.priority, 0
          );

          // Route status based on importance score
          let aiQueueStatus: string;
          if (importanceScore >= 70) {
            aiQueueStatus = "pending_ai";
            console.log(`  🔥 Score=${importanceScore} → pending_ai (fast-track rewrite)`);
          } else if (importanceScore >= 40) {
            aiQueueStatus = "batch_ai";
            console.log(`  ⚡ Score=${importanceScore} → batch_ai`);
          } else {
            aiQueueStatus = "completed";
            console.log(`  😴 Score=${importanceScore} → published immediately (no AI cost)`);
          }

          const skipAi = AI_SKIP_CATEGORIES.has(feed.category) || wordCount < 150;

          // ── INSERT ARTICLE IMMEDIATELY ────────────────────
          const payload: Record<string, any> = {
            slug: baseSlug,
            title: item.title,
            excerpt: (item.contentSnippet || item.content || `${feed.category} వార్తలు.`).slice(0, 300),
            content: rssSnippet,
            category: feed.category,
            tags: [feed.category, "వార్తలు", "news"],
            meta_title: item.title.slice(0, 70),
            meta_description: (item.contentSnippet || item.title).slice(0, 160),
            og_image: imageResult.imageUrl,
            author_name: sourceName,
            source_logo: sourceLogoUrl,
            language: "te",
            published: true,
            featured: importanceScore >= 85,
            reading_time_min: Math.max(1, Math.ceil(wordCount / 200)),
            published_at: publishedAtStr,
            source_article_url: resolvedUrl,
            source_url: originalUrl,
            publisher: feed.publisher,
            thumbnail_url: imageResult.imageUrl,
            featured_image_url: imageResult.imageUrl,
            image_storage_path: imageResult.storagePath,
            image_tags: [feed.category],
            content_hash: hash,
            summary_short: (item.contentSnippet || "").slice(0, 120),
            summary_medium: (item.contentSnippet || rssSnippet).slice(0, 400),
            summary_long: rssSnippet,
            social_thumbnail_url: aiQueueStatus, // backward compat
            ai_queue_status: aiQueueStatus,

            relevance_score: importanceScore,
            extraction_quality_score: extractionScore,
            word_count: wordCount,
            image_validation_status: imageResult.storagePath ? "approved" : "placeholder",
            image_validation_reason: imageResult.storagePath
              ? `WebP uploaded (score=${importanceScore})`
              : `Category placeholder (score=${importanceScore})`,
            validated_at: new Date().toISOString(),
            telegram_posted: false,
            sitemap_pinged: false,
          };

          let { error: insertError } = await supabase.from("blog_posts").insert(payload);

          // Graceful fallback if new columns don't exist yet
          if (insertError?.message.includes("column")) {
            console.warn(`  ⚠️  Schema missing columns. Retrying with safe payload...`);
            const safeKeys = [
              "slug","title","excerpt","content","category","tags","meta_title",
              "meta_description","og_image","author_name","source_logo","language",
              "published","featured","reading_time_min","published_at",
              "source_article_url","content_hash","relevance_score",
              "social_thumbnail_url","thumbnail_url","featured_image_url",
              "summary_short","summary_medium","image_validation_status","image_tags"
            ];
            const safePayload: Record<string, any> = {};
            for (const k of safeKeys) { if (payload[k] !== undefined) safePayload[k] = payload[k]; }
            const retryRes = await supabase.from("blog_posts").insert(safePayload);
            insertError = retryRes.error;
          }

          if (insertError) {
            console.error(`  ❌ Insert failed: ${insertError.message}`);
            stats.failed++;
            continue;
          }

          stats.inserted++;
          console.log(`  ✅ [INSERTED] "${item.title.slice(0, 55)}..."`);

          // ── CREATE PIPELINE JOB ENTRIES ───────────────────
          await createPipelineJobs(baseSlug, importanceScore, feed.priority, wordCount, feed.category, skipAi);

        } catch (articleErr: any) {
          console.error(`  ❌ Article error: ${articleErr.message}`);
          stats.failed++;
        }

        // Short delay between articles (not between feeds — scheduler handles that)
        await delay(1800);
      }
    } catch (feedErr: any) {
      console.error(`❌ Feed error [${feed.category}/${feed.publisher}]: ${feedErr.message}`);
    }

    // Inter-feed delay: shorter for direct feeds, longer for Google News
    await delay(8000);
  }

  // ─── Final Summary ──────────────────────────────────────────
  const durationMs = Date.now() - stats.startTime;
  const dMin = Math.floor(durationMs / 60_000);
  const dSec = Math.floor((durationMs % 60_000) / 1000);

  console.log("\n" + "═".repeat(70));
  console.log("📊  PIPELINE SUMMARY");
  console.log("═".repeat(70));
  console.log(`   Total Processed:      ${stats.totalProcessed}`);
  console.log(`   ✅ Inserted:          ${stats.inserted}`);
  console.log(`   ⏭ Skipped (dupes):   ${stats.skipped}`);
  console.log(`   ❌ Failed:            ${stats.failed}`);
  console.log(`   📤 Images (WebP):     ${stats.imagesUploaded}`);
  console.log(`   ❌ Images rejected:   ${stats.imagesRejected}`);
  console.log(`   📋 Jobs queued:       ${stats.jobsQueued}`);
  console.log(`   ⏱️  Duration:          ${dMin}m ${dSec}s`);
  console.log("═".repeat(70));

  // Write stats for scheduler self-tuning
  try {
    if (!fs.existsSync("scratch")) fs.mkdirSync("scratch", { recursive: true });
    fs.writeFileSync("scratch/latest_ingest_stats.json", JSON.stringify({
      category: targetCategory,
      inserted: stats.inserted,
      failed: stats.failed,
      jobsQueued: stats.jobsQueued,
      timestamp: Date.now()
    }));
  } catch {}
}

run().catch(e => {
  console.error("💀 Fatal pipeline error:", e);
  process.exit(1);
});
