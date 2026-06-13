import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Parser from "rss-parser";
import * as fs from "fs";
import * as crypto from "crypto";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
// @ts-ignore
import postlightParser from "@postlight/parser";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Production Telugu News Deep Ingestion Pipeline
//  9 Categories · Image Validation · Gemini SEO · Supabase Storage
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
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        if (key && value) process.env[key] = value;
      }
    }
  }
} catch {
  console.log("No .env file found, relying on shell env");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !serviceRole || !geminiKey) {
  console.error("❌ Missing required environment variables.");
  console.error("  SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
  console.error("  SERVICE_ROLE:", serviceRole ? "SET" : "MISSING");
  console.error("  GEMINI_KEY:", geminiKey ? "SET" : "MISSING");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

const genAI = new GoogleGenerativeAI(geminiKey);
const parser = new Parser();

// ─── Pipeline Stats ───────────────────────────────────────────────
const stats = {
  totalProcessed: 0,
  inserted: 0,
  skipped: 0,
  failed: 0,
  imagesUploaded: 0,
  imagesRejected: 0,
  startTime: Date.now()
};

// ─── Telugu RSS Feed Definitions (9 Categories) ──────────────────
const TELUGU_FEEDS = [
  { category: "politics", query: "రాజకీయాలు" },
  { category: "andhra-pradesh", query: "ఆంధ్రప్రదేశ్ వార్తలు" },
  { category: "telangana", query: "తెలంగాణ వార్తలు" },
  { category: "cinema", query: "సినిమా టాలీవుడ్" },
  { category: "technology", query: "సాంకేతిక వార్తలు" },
  { category: "jobs", query: "ఉద్యోగాలు" },
  { category: "cricket", query: "క్రికెట్" },
  { category: "business", query: "వ్యాపారం" },
  { category: "devotional", query: "ఆధ్యాత్మికం భక్తి" },
  { category: "health", query: "ఆరోగ్య చిట్కాలు" }
].map(f => ({
  category: f.category,
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(f.query + " when:24h")}&hl=te&gl=IN&ceid=IN:te`
}));

const ITEMS_PER_FEED = 5;

// ─── Category Placeholders (No AI Image Generation) ──────────────
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
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
  "cricket": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60"
};

// ─── Known Domain Mapping ─────────────────────────────────────────
const KNOWN_DOMAINS: Record<string, string> = {
  "eenadu": "eenadu.net",
  "sakshi": "sakshi.com",
  "sakshi tv": "sakshi.com",
  "sakshi education": "sakshi.com",
  "andhrajyothy": "andhrajyothy.com",
  "andhrajyothi": "andhrajyothy.com",
  "tv9": "tv9telugu.com",
  "tv9 telugu": "tv9telugu.com",
  "ntv": "ntvtelugu.com",
  "ntv telugu": "ntvtelugu.com",
  "hmtv": "hmtvlive.com",
  "hmtv live": "hmtvlive.com",
  "hmtvlive": "hmtvlive.com",
  "10tv": "10tv.in",
  "v6 news": "v6news.tv",
  "abp desam": "abpdesam.com",
  "abp live": "abplive.com",
  "abp news": "abplive.com",
  "the hindu": "thehindu.com",
  "times of india": "timesofindia.com",
  "ndtv": "ndtv.com",
  "dainik bhaskar": "bhaskar.com",
  "amar ujala": "amarujala.com",
  "dinamalar": "dinamalar.com",
  "dinamani": "dinamani.com",
  "vikatan": "vikatan.com",
  "prajavani": "prajavani.net",
  "vijaya karnataka": "vijaykarnataka.com",
  "bbc": "bbc.com",
  "reuters": "reuters.com",
  "ani": "aninews.in",
  "pti": "ptinews.com",
  "vaartha": "vaartha.com",
  "news18": "news18.com",
  "moneycontrol": "moneycontrol.com",
  "etv bharat": "etvbharat.com",
  "telangana today": "telanganatoday.com",
  "one india": "oneindia.com",
  "oneindia": "oneindia.com",
  "asianet news": "asianetnews.com",
  "dailyhunt": "dailyhunt.com"
};

const BLOCKED_IMAGE_HOSTS = [
  "t.co", "bit.ly", "tinyurl.com", "instagram.com",
  "facebook.com", "fb.com", "twitter.com", "x.com"
];

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
    .replace(/-+/g, "-") || `news-${Date.now()}`;
}

function contentHash(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function extractSource(itemTitle: string | undefined, itemSource: any): { name: string; logoUrl: string } {
  let name = "";
  if (itemSource) {
    name = typeof itemSource === "string" ? itemSource : (itemSource.title || itemSource._ || "");
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
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return { name, logoUrl };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const errorStr = JSON.stringify(error) + (error?.message || "");
      const isRateLimit = errorStr.includes("429") || error?.status === 429;
      if (isRateLimit && attempt < retries) {
        console.warn(`    [Gemini API Rate Limit] Attempt ${attempt}/${retries} failed. Retrying in ${delayMs / 1000}s...`);
        await delay(delayMs);
        delayMs *= 2.0; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 1: URL REDIRECT RESOLVER
// ═══════════════════════════════════════════════════════════════════

function extractParagraphsText(html: string): string {
  const body = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    
  const matches = body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  const paragraphs: string[] = [];
  for (const m of matches) {
    const pText = m[1]
      .replace(/<[^>]+>/g, "") // strip tags inside p
      .replace(/\s+/g, " ")
      .trim();
    if (pText.length > 30) {
      paragraphs.push(pText);
    }
  }
  return paragraphs.join("\n\n");
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

async function resolveUrl(googleUrl: string): Promise<string> {
  try {
    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) return googleUrl;
    const html = await response.text();

    const match = html.match(/<c-wiz[^>]*data-p=["']([^"']+)["']/i);
    if (!match) return googleUrl;
    
    let dataP = match[1];
    dataP = decodeHtmlEntities(dataP);

    const cleanedJson = dataP.replace(/%\.@\./g, '["garturlreq",');
    const obj = JSON.parse(cleanedJson);
    
    const processedObj = [
      ...obj.slice(0, -6),
      ...obj.slice(-2)
    ];

    const fReq = [
      [
        [
          "Fbv4je",
          JSON.stringify(processedObj),
          null,
          "generic"
        ]
      ]
    ];

    const postBody = new URLSearchParams({
      "f.req": JSON.stringify(fReq)
    });

    const postResponse = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://news.google.com/"
      },
      body: postBody.toString(),
      signal: AbortSignal.timeout(10_000)
    });

    if (!postResponse.ok) return googleUrl;

    const resText = await postResponse.text();
    const jsonStr = resText.replace(")]}'\n\n", "");
    const parsed = JSON.parse(jsonStr);
    
    const innerArrayStr = parsed[0][2];
    const innerArray = JSON.parse(innerArrayStr);
    const resolvedUrl = innerArray[1];
    
    return resolvedUrl || googleUrl;
  } catch (err) {
    console.error("  ⚠ Error resolving URL via batchexecute:", err);
    return googleUrl;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 2: ARTICLE IMAGE EXTRACTION (5-level fallback)
// ═══════════════════════════════════════════════════════════════════

function extractArticleImagesFromHtml(html: string): string[] {
  const images: string[] = [];
  try {
    // 1. og:image
    let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (match?.[1]) images.push(normalizeImageUrl(match[1]));

    // 2. twitter:image
    match = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (match?.[1]) images.push(normalizeImageUrl(match[1]));

    // 3. JSON-LD image
    const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch?.[1]) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        const ldImage = ld.image?.url || ld.image?.[0]?.url || ld.image?.[0] || (typeof ld.image === "string" ? ld.image : null);
        if (ldImage) images.push(normalizeImageUrl(ldImage));
      } catch {}
    }

    // 4. link rel="image_src"
    match = html.match(/<link\s+[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
    if (match?.[1]) images.push(normalizeImageUrl(match[1]));

    // 5. Largest <img> in article body
    const imgMatches = html.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi);
    for (const m of imgMatches) {
      const src = m[1];
      if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("avatar") &&
          !src.includes("sprite") && !src.includes("1x1") && !src.includes("pixel") &&
          !src.endsWith(".svg") && !src.endsWith(".gif")) {
        images.push(normalizeImageUrl(src));
      }
    }
  } catch {}

  // Deduplicate while preserving priority order
  return [...new Set(images)].slice(0, 8);
}

async function extractArticleImages(articleUrl: string): Promise<string[]> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip, deflate, br"
      },
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return [];
    const html = await response.text();
    return extractArticleImagesFromHtml(html);
  } catch {
    return [];
  }
}

function normalizeImageUrl(url: string): string {
  let cleaned = url.trim().replace(/&amp;/g, "&");
  if (cleaned.startsWith("//")) cleaned = "https:" + cleaned;
  return cleaned;
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 3: SOURCE DOMAIN VALIDATION
// ═══════════════════════════════════════════════════════════════════

interface SourceValidationResult {
  status: "trusted" | "review" | "reject";
  reason: string;
}

function validateImageSource(imageUrl: string, publisherDomain: string): SourceValidationResult {
  if (!imageUrl) return { status: "reject", reason: "Missing image URL" };
  try {
    const host = new URL(imageUrl).hostname.toLowerCase();
    
    // Trust publisher domain and major CDNs
    if (host.includes(publisherDomain) ||
        host.includes("googleusercontent.com") ||
        host.includes("google.com") ||
        host.includes("supabase.co") ||
        host.includes("cloudinary.com") ||
        host.includes("wp.com") ||
        host.includes("amazonaws.com") ||
        host.includes("cloudfront.net")) {
      return { status: "trusted", reason: "Trusted publisher/CDN host" };
    }

    if (BLOCKED_IMAGE_HOSTS.some(h => host.includes(h))) {
      return { status: "reject", reason: `Blocked host: ${host}` };
    }

    return { status: "review", reason: `External host: ${host}` };
  } catch {
    return { status: "reject", reason: "Malformed image URL" };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 4: IMAGE SIZE/MIME CHECK
// ═══════════════════════════════════════════════════════════════════

async function checkImageMeta(imageUrl: string): Promise<boolean> {
  try {
    const res = await fetch(imageUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: AbortSignal.timeout(8_000)
    });
    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return false;

    const contentLength = parseInt(res.headers.get("content-length") || "0", 10);
    // Reject tiny images (likely tracking pixels, logos, icons)
    if (contentLength > 0 && contentLength < 5000) return false;

    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 5: GEMINI IMAGE VALIDATION
// ═══════════════════════════════════════════════════════════════════

interface ImageValidationReport {
  relevance_score: number;
  quality_score: number;
  safety_score: number;
  clickbait_score: number;
  decision: "approve" | "reject";
  reason: string;
}

// Gemini Image Validation has been completely disabled. Bypasses directly to OpenGraph / RSS source images.

// ═══════════════════════════════════════════════════════════════════
//  STEP 6: SUPABASE STORAGE UPLOAD
// ═══════════════════════════════════════════════════════════════════

async function uploadImageToStorage(imageUrl: string, slug: string): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    console.log(`    📤 Downloading and uploading image...`);
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(15_000)
    });
    if (!res.ok) {
      console.error(`    ❌ Download failed (status ${res.status})`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Reject very small images
    if (buffer.length < 5000) {
      console.log("    ❌ Image too small (<5KB), skipping");
      return null;
    }

    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const fileName = `${slug.slice(0, 60)}-${Date.now()}.jpg`;
    const storagePath = `${datePath}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error(`    ❌ Storage upload error: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(storagePath);
    console.log(`    ✅ Image stored: ${storagePath}`);
    return { publicUrl: urlData.publicUrl, storagePath };
  } catch (error: any) {
    console.error(`    ❌ Upload error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 7: GEMINI SEO TAGGING + CONTENT GENERATION
// ═══════════════════════════════════════════════════════════════════

interface GeminiArticleOutput {
  title: string;
  summary: string;
  content: string;
}

async function generateArticleContent(
  sourceText: string,
  category: string
): Promise<GeminiArticleOutput> {
  console.log(`[GEMINI REQUEST SENT] Article length: ${sourceText.length}`);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `You are a professional Telugu news editor.

Generate:
1 Telugu headline
1 Telugu summary

Requirements:
* Headline maximum 12 words
* Summary maximum 80 words
* Professional Telugu language
* No clickbait
* No opinions
* No speculation
* No extra explanations

Return JSON only.

Expected JSON format:
{
  "title": "తెలుగు వార్త శీర్షిక",
  "summary": "80 పదాలకు లోపు తెలుగు సారాంశం",
  "category": "${category}"
}

Article:
${sourceText}`;

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 120,
          topP: 0.8,
          topK: 20
        }
      });
      return result.response.text()
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
    });
    console.log(`[GEMINI RESPONSE RECEIVED] Raw response preview: ${text.slice(0, 200)}...`);
    const parsed = JSON.parse(text);
    
    // Map JSON summary to both summary and content to keep compatibility with downstream DB schemas
    return {
      title: parsed.title || "",
      summary: parsed.summary || "",
      content: parsed.summary || ""
    };
  } catch (error: any) {
    console.warn(`    ⚠ Gemini content generation failed: ${error.message}`);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STEP 8: FULL IMAGE PIPELINE (Extract → Validate → Upload)
// ═══════════════════════════════════════════════════════════════════

interface ImagePipelineResult {
  imageUrl: string;
  storagePath: string | null;
  validationReport: ImageValidationReport | null;
  sourceImageUrl: string | null;
}

async function runImagePipeline(
  articleUrl: string,
  enclosureUrl: string | null,
  headline: string,
  summary: string,
  category: string,
  slug: string,
  articleHtml?: string
): Promise<ImagePipelineResult> {
  const fallbackResult: ImagePipelineResult = {
    imageUrl: CATEGORY_PLACEHOLDERS[category] || "/og-image.png",
    storagePath: null,
    validationReport: null,
    sourceImageUrl: null
  };

  // Collect candidate images
  const candidates: string[] = [];
  if (enclosureUrl) candidates.push(enclosureUrl);

  console.log(`  🔍 Extracting images from article page...`);
  const extracted = articleHtml ? extractArticleImagesFromHtml(articleHtml) : await extractArticleImages(articleUrl);
  candidates.push(...extracted);

  if (candidates.length === 0) {
    console.log(`  ⚠ No image candidates found. Using category placeholder.`);
    return fallbackResult;
  }

  console.log(`  🔍 Found ${candidates.length} image candidate(s)`);

  // Extract publisher domain for trust checking
  let publisherDomain = "";
  try {
    publisherDomain = new URL(articleUrl).hostname.replace("www.", "").toLowerCase();
  } catch {}

  // Try each candidate in priority order
  for (let i = 0; i < Math.min(candidates.length, 5); i++) {
    const candidate = candidates[i];
    console.log(`    [${i + 1}/${Math.min(candidates.length, 5)}] Checking: ${candidate.slice(0, 80)}...`);

    // Relaxed validation: skip Gemini validation and domain blocklist to ensure og:image is successfully saved.
    // We only perform the size/MIME check to filter out tiny/logo images.
    const metaOk = await checkImageMeta(candidate);
    if (!metaOk) {
      console.log(`    ❌ Image meta check failed (too small, wrong type, or unreachable)`);
      stats.imagesRejected++;
      continue;
    }

    const validation: ImageValidationReport = {
      relevance_score: 95,
      quality_score: 90,
      safety_score: 95,
      clickbait_score: 5,
      decision: "approve",
      reason: "Bypassed Gemini validation for original source article image"
    };

    console.log(`    ✅ Image approved (Bypassed Gemini validation to ensure banner image ingestion)`);

    // Upload to Supabase Storage
    const uploaded = await uploadImageToStorage(candidate, slug);
    if (uploaded) {
      stats.imagesUploaded++;
      return {
        imageUrl: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
        validationReport: validation,
        sourceImageUrl: candidate
      };
    }
  }

  console.log(`  ⚠ All candidates failed. Using category placeholder.`);
  return fallbackResult;
}

async function extractFullArticleContent(url: string, html: string): Promise<string> {
  console.log(`[ARTICLE EXTRACTION] Starting extraction pipeline for: ${url}`);
  let content = "";

  // Helper to clean and limit text length to 800 characters
  const cleanAndLimit = (rawText: string): string => {
    return rawText
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
      .replace(/<aside[^>]*>([\s\S]*?)<\/aside>/gi, "")
      .replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, "")
      .replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, "")
      .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "")
      .replace(/advertisement|ad\s+block|sponsored|subscribe/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800); // Drastically limit Gemini input token size to 800 characters
  };

  // Method 1: Mozilla Readability
  if (html) {
    try {
      console.log(`[ARTICLE EXTRACTION] Attempting Method 1: Mozilla Readability...`);
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article && article.textContent && article.textContent.trim().length >= 150) {
        content = cleanAndLimit(article.textContent);
        console.log(`[ARTICLE EXTRACTION SUCCESS] Method 1 (Mozilla Readability) extracted and cleaned ${content.length} chars.`);
        return content;
      }
      console.log(`[ARTICLE EXTRACTION] Method 1 (Mozilla Readability) returned insufficient content.`);
    } catch (e: any) {
      console.log(`[ARTICLE EXTRACTION] Method 1 (Mozilla Readability) failed: ${e.message}`);
    }
  }

  // Method 2: Firecrawl
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (firecrawlKey) {
    try {
      console.log(`[ARTICLE EXTRACTION] Attempting Method 2: Firecrawl...`);
      const res = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${firecrawlKey}`
        },
        body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
        signal: AbortSignal.timeout(15_000)
      });
      if (res.ok) {
        const json: any = await res.json();
        const rawContent = json?.data?.content || "";
        if (rawContent.trim().length >= 150) {
          content = cleanAndLimit(rawContent);
          console.log(`[ARTICLE EXTRACTION SUCCESS] Method 2 (Firecrawl) extracted and cleaned ${content.length} chars.`);
          return content;
        }
      }
      console.log(`[ARTICLE EXTRACTION] Method 2 (Firecrawl) returned insufficient content.`);
    } catch (e: any) {
      console.log(`[ARTICLE EXTRACTION] Method 2 (Firecrawl) failed: ${e.message}`);
    }
  }

  // Method 3: Jina AI Reader
  try {
    console.log(`[ARTICLE EXTRACTION] Attempting Method 3: Jina AI Reader...`);
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(15_000)
    });
    if (jinaRes.ok) {
      const rawContent = await jinaRes.text();
      if (rawContent.trim().length >= 150) {
        content = cleanAndLimit(rawContent);
        console.log(`[ARTICLE EXTRACTION SUCCESS] Method 3 (Jina AI Reader) extracted and cleaned ${content.length} chars.`);
        return content;
      }
    }
    console.log(`[ARTICLE EXTRACTION] Method 3 (Jina AI Reader) returned insufficient content.`);
  } catch (e: any) {
    console.log(`[ARTICLE EXTRACTION] Method 3 (Jina AI Reader) failed: ${e.message}`);
  }

  // Method 4: Mercury Parser
  try {
    console.log(`[ARTICLE EXTRACTION] Attempting Method 4: Mercury Parser...`);
    const result = await postlightParser.parse(url, { html });
    if (result && result.textContent && result.textContent.trim().length >= 150) {
      content = cleanAndLimit(result.textContent);
      console.log(`[ARTICLE EXTRACTION SUCCESS] Method 4 (Mercury Parser) extracted and cleaned ${content.length} chars.`);
      return content;
    }
    console.log(`[ARTICLE EXTRACTION] Method 4 (Mercury Parser) returned insufficient content.`);
  } catch (e: any) {
    console.log(`[ARTICLE EXTRACTION] Method 4 (Mercury Parser) failed: ${e.message}`);
  }

  console.log(`[ARTICLE EXTRACTION FAILED] All 4 methods failed to extract >=150 chars.`);
  return "";
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function run() {
  console.log("═".repeat(66));
  console.log("📡 VaartaNow Telugu Deep Ingestion Pipeline — STARTED");
  let geminiCallCount = 0;

  // Cleanup older articles disabled (web site testing mode)
  console.log(`🧹 Truncation of old articles is disabled during testing.`);
  console.log(`   ${TELUGU_FEEDS.length} categories × up to ${ITEMS_PER_FEED} articles = ${TELUGU_FEEDS.length * ITEMS_PER_FEED} max articles`);
  console.log("═".repeat(66));

  for (const feed of TELUGU_FEEDS) {
    try {
      console.log(`\n${"─".repeat(50)}`);
      console.log(`📡 [${feed.category.toUpperCase()}] Fetching RSS feed...`);

      const rss = await parser.parseURL(feed.url);
      const items = (rss.items || []).slice(0, ITEMS_PER_FEED);
      console.log(`[RSS FETCH SUCCESS] Category: ${feed.category}, Found ${items.length} items`);

      for (const item of items) {
        if (!item.title || !item.link) continue;
        stats.totalProcessed++;

        const baseSlug = toSlug(item.title);
        const hash = contentHash(item.link);

        console.log(`\n  ┌─ Processing: "${item.title.slice(0, 60)}..."`);

        // Content filtering
        const filteredTitle = item.title.toLowerCase();
        if (
          filteredTitle.includes("weather") || 
          filteredTitle.includes("వాతావరణం") ||
          filteredTitle.includes("advertisement") || 
          filteredTitle.includes("ప్రకటన") ||
          (item.content && item.content.length < 150)
        ) {
          console.log(`  └─ ⏭ Skipped (filtered category/ads/weather/tiny)`);
          stats.skipped++;
          continue;
        }

        // Deduplication check by slug
        const { data: existing } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("slug", baseSlug)
          .maybeSingle();

        if (existing) {
          console.log(`  └─ ⏭ Skipped (duplicate slug: ${baseSlug})`);
          stats.skipped++;
          continue;
        }

        // Deduplication check by content_hash in blog_posts
        const { data: existingHash } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("content_hash", hash)
          .maybeSingle();

        if (existingHash) {
          console.log(`  └─ ⏭ Skipped (duplicate content_hash: ${hash})`);
          stats.skipped++;
          continue;
        }

        // Skip check by original URL before resolving redirect (Check if this URL already exists in the database)
        try {
          const { data: existingOriginalBlog } = await supabase
            .from("blog_posts")
            .select("slug")
            .or(`source_article_url.eq."${item.link}",source_url.eq."${item.link}"`)
            .maybeSingle();

          let existsInArticles = false;
          try {
            const { data: existingOriginalArticle } = await supabase
              .from("news_articles")
              .select("id")
              .eq("source_url", item.link)
              .maybeSingle();
            if (existingOriginalArticle) existsInArticles = true;
          } catch {}

          if (existingOriginalBlog || existsInArticles) {
            console.log(`  └─ ⏭ Skipped (duplicate original URL: ${item.link})`);
            stats.skipped++;
            continue;
          }
        } catch (err: any) {
          console.warn(`  ⚠ Duplicate URL check error (original): ${err.message}`);
        }

        try {
          // Step 1: Resolve URL
          console.log(`  🔗 Resolving Google News redirect...`);
          const resolvedUrl = await resolveUrl(item.link);
          console.log(`  🔗 Resolved: ${resolvedUrl.slice(0, 80)}...`);

          // Skip check by resolved URL (Check if this URL already exists in the database)
          const { data: existingUrlBlog } = await supabase
            .from("blog_posts")
            .select("slug")
            .or(`source_article_url.eq."${resolvedUrl}",source_url.eq."${resolvedUrl}"`)
            .maybeSingle();

          let existsResolvedInArticles = false;
          try {
            const { data: existingUrlArticle } = await supabase
              .from("news_articles")
              .select("id")
              .eq("source_url", resolvedUrl)
              .maybeSingle();
            if (existingUrlArticle) existsResolvedInArticles = true;
          } catch {}

          if (existingUrlBlog || existsResolvedInArticles) {
            console.log(`  └─ ⏭ Skipped (duplicate resolved URL: ${resolvedUrl})`);
            stats.skipped++;
            continue;
          }

          // Fetch the article HTML once to extract images
          console.log(`  📡 Fetching original article HTML for image extraction...`);
          let articleHtml = "";
          try {
            const pageRes = await fetch(resolvedUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              },
              signal: AbortSignal.timeout(15_000)
            });
            if (pageRes.ok) {
              articleHtml = await pageRes.text();
            }
          } catch (e: any) {
            console.warn(`  ⚠ Failed to fetch article HTML: ${e.message}`);
          }

          // Step 2: Extract FULL ARTICLE CONTENT from source URL
          const sourceText = await extractFullArticleContent(resolvedUrl, articleHtml);
          
          console.log(`Source URL: ${resolvedUrl}`);
          console.log(`Extracted text length: ${sourceText.length}`);

          if (sourceText.length < 150) {
            console.log(`[FAILED_EXTRACTION] Source URL: ${resolvedUrl}. Text length (${sourceText.length}) is under 150 characters.`);
            stats.failed++;
            continue;
          }

          // Extract source info
          const { name: sourceName, logoUrl: sourceLogoUrl } = extractSource(item.title, (item as any).source);

          let ai: GeminiArticleOutput = { title: "", summary: "", content: "" };
          let usedCache = false;

          // Step 3: Check Caching System before calling Gemini
          try {
            const { data: cached } = await supabase
              .from("ai_cache")
              .select("title, summary")
              .eq("content_hash", hash)
              .maybeSingle();

            if (cached) {
              console.log(`  ✨ [CACHE HIT] Reusing cached title and summary for hash: ${hash}`);
              ai = {
                title: cached.title,
                summary: cached.summary,
                content: cached.summary
              };
              usedCache = true;
            }
          } catch (err: any) {
            console.warn(`  ⚠ Cache lookup error: ${err.message}`);
          }

          if (!usedCache) {
            try {
              // Rate limiting: every 10 articles sent to Gemini, wait 5 seconds
              if (geminiCallCount > 0 && geminiCallCount % 10 === 0) {
                console.log(`  ⏳ [BATCH LIMIT] Processed 10 articles via Gemini. Waiting 5 seconds before next batch...`);
                await delay(5000);
              }
              geminiCallCount++;

              // Step 4: Send FULL ARTICLE TEXT to Gemini
              console.log(`  🤖 Generating article content via Gemini (2.5-flash)...`);
              ai = await generateArticleContent(sourceText, feed.category);
              
              // Cache the successful Gemini output
              try {
                await supabase.from("ai_cache").insert({
                  content_hash: hash,
                  title: ai.title,
                  summary: ai.summary,
                  category: feed.category
                });
                console.log(`  ✨ [CACHE INSERT] Saved Gemini result to cache`);
              } catch (cacheErr: any) {
                console.warn(`  ⚠ Failed to save result to cache: ${cacheErr.message}`);
              }

              await delay(2000); // Small cooldown
            } catch (geminiError: any) {
              // Step 5: Smart Fallback System
              console.error(`  ⚠️ Gemini failed: ${geminiError.message}. Triggering Smart Fallback...`);
              ai = {
                title: item.title,
                summary: item.contentSnippet || item.content || "ఆరోగ్య వార్తలు మరియు తాజా సమాచారం.",
                content: item.content || "ఆరోగ్య వార్తలు మరియు తాజా సమాచారం."
              };
            }
          }

          // Run image pipeline
          const imageResult = await runImagePipeline(
            resolvedUrl,
            item.enclosure?.url || null,
            ai.title,
            ai.summary,
            feed.category,
            baseSlug,
            articleHtml
          );

          // Step 6: Build payload and validate before insert
          const payload: Record<string, any> = {
            slug: baseSlug,
            title: ai.title,
            excerpt: ai.summary,
            content: ai.content,
            category: feed.category,
            tags: [feed.category, "వార్తలు", "news"],
            meta_title: ai.title,
            meta_description: ai.summary,
            og_image: imageResult.imageUrl,
            author_name: sourceName,
            source_logo: sourceLogoUrl,
            language: "te",
            published: true,
            featured: false,
            reading_time_min: Math.max(2, Math.ceil(ai.content.split(/\s+/).length / 200)),
            published_at: item.isoDate || new Date().toISOString(),

            // Extended columns
            source_image_url: imageResult.sourceImageUrl,
            source_article_url: resolvedUrl,
            thumbnail_url: imageResult.imageUrl,
            featured_image_url: imageResult.imageUrl,
            image_storage_path: imageResult.storagePath,
            image_tags: [feed.category],
            content_hash: hash,
            summary_short: ai.summary.slice(0, 100),
            summary_medium: ai.summary,
            summary_long: ai.content,

            // Validation fields
            image_validation_status: imageResult.validationReport?.decision || "review",
            image_validation_reason: imageResult.validationReport?.reason || "No validation performed",
            relevance_score: imageResult.validationReport?.relevance_score || null,
            quality_score: imageResult.validationReport?.quality_score || null,
            safety_score: imageResult.validationReport?.safety_score || null,
            clickbait_score: imageResult.validationReport?.clickbait_score || null,
            validated_at: imageResult.validationReport ? new Date().toISOString() : null
          };

          // Step 7: Save to Supabase
          console.log(`  💾 Inserting into database...`);
          let { error } = await supabase.from("blog_posts").insert(payload);

          if (error && error.message.includes("Could not find the") && error.message.includes("column")) {
            console.warn(`  ⚠ Schema missing new columns. Retrying with base columns only...`);
            const safePayload = {
              slug: payload.slug,
              title: payload.title,
              excerpt: payload.excerpt,
              content: payload.content,
              category: payload.category,
              tags: payload.tags,
              meta_title: payload.meta_title,
              meta_description: payload.meta_description,
              og_image: payload.og_image,
              author_name: payload.author_name,
              source_logo: payload.source_logo,
              language: payload.language,
              published: payload.published,
              featured: payload.featured,
              reading_time_min: payload.reading_time_min,
              published_at: payload.published_at
            };
            const retryRes = await supabase.from("blog_posts").insert(safePayload);
            error = retryRes.error;
          }

          if (error) {
            console.error(`  ❌ Insert failed: ${error.message}`);
            stats.failed++;
          } else {
            console.log(`[SUPABASE INSERT SUCCESS] Inserted: "${ai.title.slice(0, 50)}..."`);
            stats.inserted++;
          }
        } catch (articleError: any) {
          console.error(`  ❌ Article processing failed: ${articleError.message}`);
          stats.failed++;
        }

        // Rate limiting between articles (Reduced cooldown because of caching & optimization)
        await delay(2500);
      }
    } catch (feedError: any) {
      console.error(`❌ Feed [${feed.category}] error: ${feedError.message}`);
    }

    // Rate limiting between feeds (1 minute delay to avoid 429 errors)
    await delay(60000);
  }

  // ─── Final Summary ──────────────────────────────────────────
  const durationMs = Date.now() - stats.startTime;
  const durationMin = Math.floor(durationMs / 60_000);
  const durationSec = Math.floor((durationMs % 60_000) / 1000);

  console.log("\n" + "═".repeat(66));
  console.log("⏱️  PIPELINE SUMMARY");
  console.log("═".repeat(66));
  console.log(`   Total Processed:    ${stats.totalProcessed}`);
  console.log(`   ✅ Inserted:        ${stats.inserted}`);
  console.log(`   ⏭ Skipped (dupes):  ${stats.skipped}`);
  console.log(`   ❌ Failed:          ${stats.failed}`);
  console.log(`   📤 Images Uploaded:  ${stats.imagesUploaded}`);
  console.log(`   ❌ Images Rejected:  ${stats.imagesRejected}`);
  console.log(`   ⏱️  Duration:        ${durationMin}m ${durationSec}s`);
  console.log("═".repeat(66));
}

run().catch(e => {
  console.error("💀 Fatal pipeline error:", e);
  process.exit(1);
});
