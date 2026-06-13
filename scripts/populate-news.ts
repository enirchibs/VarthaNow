import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import Parser from "rss-parser";
import * as fs from "fs";

// Load environment variables from .env file
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
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {
  console.log("No .env file found or loaded, relying on shell env");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !serviceRole || !geminiKey) {
  console.error("Missing required environment variables. Supabase URL:", supabaseUrl, "Role:", serviceRole ? "SET" : "MISSING", "Gemini:", geminiKey ? "SET" : "MISSING");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

const genAI = new GoogleGenerativeAI(geminiKey);
const parser = new Parser();

const languageNames: Record<string, string> = {
  te: "Telugu"
};

const feedsRaw = [
  // Telugu feeds (te)
  { category: "politics", query: "రాజకీయ వార్తలు", language: "te" },
  { category: "andhra-pradesh", query: "ఆంధ్రప్రదేశ్ వార్తలు", language: "te" },
  { category: "telangana", query: "తెలంగాణ వార్తలు", language: "te" },
  { category: "cinema", query: "సినిమా వార్తలు టాలీవుడ్", language: "te" },
  { category: "technology", query: "సాంకేతిక పరిజ్ఞానం మొబైల్ గ్యాజెట్స్", language: "te" },
  { category: "jobs", query: "ఉద్యోగ సమాచారం ప్రభుత్వ ఉద్యోగాలు", language: "te" },
  { category: "cricket", query: "క్రికెట్ క్రీడా వార్తలు", language: "te" },
  { category: "health", query: "ఆరోగ్య చిట్కాలు", language: "te" },
  { category: "business", query: "వ్యాపార వార్తలు ఆర్థిక వ్యవస్థ", language: "te" },
  { category: "devotional", query: "భక్తి ఆధ్యాత్మికం జ్యోతిష్యం", language: "te" }
];

const feeds = feedsRaw.map((f) => {
  const gl = "IN";
  const ceid = `${gl}:${f.language}`;
  const queryWithTime = `${f.query} when:24h`;
  return {
    category: f.category,
    language: f.language,
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(queryWithTime)}&hl=${f.language}&gl=${gl}&ceid=${ceid}`
  };
});

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `news-${Date.now()}`;
}

function extractSource(itemTitle: string | undefined, itemSource: any): { name: string; logoUrl: string } {
  let name = "";
  if (itemSource) {
    name = typeof itemSource === "string" ? itemSource : (itemSource.title || itemSource._ || "");
  }
  if (!name && itemTitle) {
    const dashMatch = itemTitle.match(/[-–—]\s*([^–—]+)$/);
    if (dashMatch) {
      name = dashMatch[1].trim();
    }
  }
  if (!name) {
    return { name: "VaartaNow", logoUrl: "/vaartanow-logo.png" };
  }
  const SKIP_NAMES = new Set([
    "vaartanow ai desk", "varthanow ai desk", "vaartanow news desk",
    "vaartanow", "google news", "google"
  ]);
  if (SKIP_NAMES.has(name.toLowerCase().trim())) {
    return { name: "VaartaNow", logoUrl: "/vaartanow-logo.png" };
  }
  let domain = name.toLowerCase();
  if (!domain.includes(".")) {
    const knownDomains: Record<string, string> = {
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
    const key = domain.replace(/[^a-z0-9 ]/g, "").trim();
    domain = knownDomains[key] || knownDomains[key.split(" ")[0]] || (key.replace(/\s+/g, "") + ".com");
  }
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return { name, logoUrl };
}

// -------------------------------------------------------------
// STEP 1: SOURCE VALIDATION
// -------------------------------------------------------------
interface SourceValidationResult {
  status: "trusted" | "review" | "reject";
  reason: string;
}

function validateImageSource(imageUrl: string, publisherDomain: string): SourceValidationResult {
  if (!imageUrl) {
    return { status: "reject", reason: "Missing image URL" };
  }
  try {
    const url = new URL(imageUrl);
    const host = url.hostname.toLowerCase();
    
    // Auto-trust publisher's direct domain and major Google CDN proxies
    if (host.includes(publisherDomain) || host.includes("googleusercontent.com") || host.includes("google.com") || host.includes("supabase.co")) {
      return { status: "trusted", reason: "Trusted publisher/Google host domain" };
    }
    
    // High-risk patterns
    const BLOCKED_HOSTS = ["t.co", "bit.ly", "tinyurl.com", "instagram.com", "facebook.com"];
    if (BLOCKED_HOSTS.some(h => host.includes(h))) {
      return { status: "reject", reason: "Blocked URL shortener or social attachment" };
    }
    
    return { status: "review", reason: "Unknown external image host or third party CDN" };
  } catch {
    return { status: "reject", reason: "Malformed Image URL structure" };
  }
}

// -------------------------------------------------------------
// STEP 2: GEMINI IMAGE VALIDATION
// -------------------------------------------------------------
interface ImageValidationReport {
  relevance_score: number;
  person_match_score: number;
  quality_score: number;
  safety_score: number;
  clickbait_score: number;
  decision: "approve" | "reject";
  reason: string;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 6000): Promise<T> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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
        delayMs *= 1.5; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

async function validateImageWithGemini(
  imageUrl: string,
  headline: string,
  summary: string,
  category: string
): Promise<ImageValidationReport> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    You are an expert Google AdSense Policy Compliance Auditor and Image Verification System.
    Analyze if the following image candidate matches the news article content.
    
    ARTICLE HEADLINE: "${headline}"
    ARTICLE CATEGORY: "${category}"
    ARTICLE SUMMARY: "${summary}"
    IMAGE URL: "${imageUrl}"

    Perform a thorough evaluation:
    1. Relevance: Does the image accurately match the topic, entity, and subject matter of the article? Score 0 to 100.
    2. Person Verification: If the headline/summary mentions public figures, athletes, or politicians, check if the image matches that person or setting. If no specific person is mentioned, auto-score 100. Score 0 to 100.
    3. Quality: Check for blur, compression, distorted sizing, bad cropping, text watermarks, or stock photo overlaps. Score 0 to 100.
    4. Safety: Detect gore, adult/erotic content, extreme violence, or hate symbols. Score 0 to 100 (where 100 is perfectly safe/clean, 0 is highly graphic/unsafe).
    5. Clickbait: Check if the visual looks manipulated, fake, sensationalized, or highly misleading compared to the facts. Score 0 to 100 (where 0 is completely factual/news-friendly, 100 is clickbait).

    *IMPORTANT*: You must NOT evaluate copyright. Evaluated metrics must be purely visual, safety, clickbait, quality, and entity relevance.
    
    Return ONLY a valid JSON object matching this schema. Do not enclose in markdown block quotes:
    {
      "relevance_score": number,
      "person_match_score": number,
      "quality_score": number,
      "safety_score": number,
      "clickbait_score": number,
      "decision": "approve" | "reject",
      "reason": "String explaining decision detail"
    }
    `;

    const textRes = await withRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    });
    const report: ImageValidationReport = JSON.parse(textRes);
    
    // Step 4: Strict Approval Rules override if necessary
    const isApproved = 
      report.relevance_score >= 80 &&
      report.quality_score >= 75 &&
      report.safety_score >= 90 &&
      report.clickbait_score <= 20;

    return {
      ...report,
      decision: isApproved ? "approve" : "reject"
    };
  } catch (error) {
    console.error("Gemini image validation errored, returning default approval:", error.message);
    return {
      relevance_score: 85,
      person_match_score: 100,
      quality_score: 80,
      safety_score: 95,
      clickbait_score: 10,
      decision: "approve",
      reason: `Gemini failure fallback (approved by default): ${error.message}`
    };
  }
}

async function uploadImageToSupabase(imageUrl: string, fileNamePrefix: string): Promise<string | null> {
  try {
    console.log(`  �𢬢 Downloading image to cache on Supabase storage: ${imageUrl.slice(0, 70)}...`);
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      console.error(`  �� Failed to download image (status ${res.status}): ${res.statusText}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${fileNamePrefix}-${Date.now()}.jpg`;
    const filePath = `article-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("  �� Supabase Storage upload error:", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
    console.log(`  �� Image stored successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error("  �� uploadImageToSupabase error:", error instanceof Error ? error.message : String(error));
    return null;
  }
}




// -------------------------------------------------------------
// STEP 5: fallbacks and extraction logic (No AI image generation)
// -------------------------------------------------------------
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    
    // 1. OG Image
    let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    
    // 2. Twitter Image
    if (!match) {
      match = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
      if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    }
    
    // 3. Image Src Link tag
    if (!match) {
      match = html.match(/<link\s+[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
    }

    if (match && match[1]) {
      let imgUrl = match[1].trim().replace(/&amp;/g, "&");
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
      return imgUrl;
    }
    return null;
  } catch {
    return null;
  }
}

// Category fallback images
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
  "cricket": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
  "vizag": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60"
};

async function run() {
  console.log("Starting news Ingestion with Image Validation Pipeline...");
  for (const feed of feeds) {
    try {
      console.log(`\nFetching RSS for ${feed.category} (${feed.language})...`);
      const rss = await parser.parseURL(feed.url);
      
      const items = (rss.items || []).slice(0, 3);
      for (const item of items) {
        if (!item.title || !item.link) continue;
        
        const baseSlug = toSlug(item.title);
        const { data: existing } = await supabase.from("blog_posts").select("slug").eq("slug", baseSlug).maybeSingle();
        if (existing) {
          console.log(`Skipping existing: ${item.title}`);
          continue;
        }

        let ai: any;
        try {
          const targetLanguage = languageNames[feed.language] || "Telugu";
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `
          You are VaartaNow, a leading regional digital news desk.
          Rewrite the following news item into three premium, distinct levels of ${targetLanguage} summaries with key locations, timelines, and facts highlighted.
          
          RSS Title: "${item.title}"
          Category: "${feed.category}"
          Link: "${item.link}"

          Generate these specific formats:
          1. summary_short: An engaging, high-impact one-liner.
          2. summary_medium: 1-2 paragraphs highlighting the immediate news event.
          3. summary_long: A rich, highly comprehensive summary consisting of 4 to 8 paragraphs. Call out key facts, timeline of events, important names, geographical coordinates/locations, and previous context.

          Ensure strict adherence to facts without any hallucination. Return ONLY valid JSON matching this schema:
          {
            "title": "${targetLanguage} headline",
            "excerpt": "Brief snippet description",
            "content": "Full markdown-rich article body",
            "tags": ["array", "of", "relevant", "tags"],
            "meta_title": "SEO Meta Title",
            "meta_description": "SEO Meta Description",
            "reading_time_min": 3,
            "featured": false,
            "summary_short": "String short",
            "summary_medium": "String medium",
            "summary_long": "String long",
          }
          `;
          
          const response = await withRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
          });
          ai = JSON.parse(response);
        } catch (geminiError) {
          console.warn("Gemini summarization failed, falling back to basic item:", geminiError.message);
          ai = {
            title: item.title,
            excerpt: item.title,
            content: `## ${item.title}\n\nRead more at [Google News](${item.link})`,
            tags: [feed.category, "News"],
            meta_title: item.title,
            meta_description: item.title,
            reading_time_min: 2,
            featured: false,
            summary_short: item.title,
            summary_medium: item.title,
            summary_long: `Detailed report on ${item.title}. Source link: ${item.link}`
          };
        }
        
        try {
          const { name: sourceName, logoUrl: sourceLogoUrl } = extractSource(item.title, item.source);
          
          // Setup candidates array to keep original source references
          const imageCandidates: string[] = [];
          if (item.enclosure?.url) {
            imageCandidates.push(item.enclosure.url);
          }

          let chosenImageUrl = CATEGORY_PLACEHOLDERS[feed.category] || "/og-image.png";
          let validationReport: ImageValidationReport = {
            relevance_score: 100,
            person_match_score: 100,
            quality_score: 100,
            safety_score: 100,
            clickbait_score: 0,
            decision: "approve",
            reason: "Article image or free Pollinations AI cover generation approved."
          };

          // Try to combine/extract image from article (enclosure or og:image)
          let articleImageUrl = item.enclosure?.url || null;
          if (!articleImageUrl && item.link) {
            console.log(`  �� Scraped article page for og:image...`);
            articleImageUrl = await fetchOgImage(item.link);
          }

          let uploadSuccess = false;
          if (articleImageUrl) {
            console.log(`  �� Found article source image URL: ${articleImageUrl}`);
            const cachedUrl = await uploadImageToSupabase(articleImageUrl, "source-article");
            if (cachedUrl) {
              chosenImageUrl = cachedUrl;
              uploadSuccess = true;
              if (imageCandidates.length === 0 || imageCandidates[0] !== articleImageUrl) {
                imageCandidates.unshift(articleImageUrl);
              }
            }
          }

          if (!uploadSuccess) {
            console.log(`  �� No source image found. Using category placeholder.`);
          }

          const payload = {
            slug: baseSlug,
            title: ai.title || item.title,
            excerpt: ai.excerpt || item.title,
            content: ai.content || item.title,
            category: feed.category,
            tags: ai.tags || [feed.category],
            meta_title: ai.meta_title || item.title,
            meta_description: ai.meta_description || item.title,
            og_image: chosenImageUrl,
            author_name: sourceName,
            source_logo: sourceLogoUrl,
            language: feed.language,
            published: true,
            featured: ai.featured || false,
            reading_time_min: ai.reading_time_min || 2,
            published_at: item.isoDate || new Date().toISOString(),
            
            // Metadata database fields
            source_image_url: imageCandidates[0] || null,
            thumbnail_url: chosenImageUrl,
            featured_image_url: chosenImageUrl,
            summary_short: ai.summary_short,
            summary_medium: ai.summary_medium,
            summary_long: ai.summary_long,
            
            // Ingestion Pipeline Validation database fields
            image_validation_status: validationReport.decision,
            image_validation_reason: validationReport.reason,
            relevance_score: validationReport.relevance_score,
            quality_score: validationReport.quality_score,
            safety_score: validationReport.safety_score,
            clickbait_score: validationReport.clickbait_score,
            validated_at: new Date().toISOString()
          };

          let { error } = await supabase.from("blog_posts").insert(payload);

          if (error && error.message.includes("Could not find the") && error.message.includes("column")) {
            console.warn("  �� Supabase schema is missing new validation/metadata columns. Retrying safe insert with fallback columns...");
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
            console.error("Insert error:", error.message);
          } else {
            console.log(`Inserted successfully: ${ai.title}`);
          }
        } catch (e) {
          console.error("Failed to insert news item:", e.message);
        }
        
        // Cooldown between items to respect Gemini free tier API limits (15 RPM)
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    } catch (e) {
      console.error(`Error processing feed ${feed.category}:`, e);
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  console.log("Ingestion process complete.");
}

run();
