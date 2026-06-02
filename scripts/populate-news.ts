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

const feedsRaw = [
  // Telugu feeds (te)
  { category: "andhra-pradesh", query: "ఆంధ్రప్రదేశ్ వార్తలు", language: "te" },
  { category: "telangana", query: "తెలంగాణ వార్తలు", language: "te" },
  { category: "cinema", query: "తెలుగు సినిమా టాలీవుడ్", language: "te" },
  { category: "vizag", query: "విశాఖపట్నం తాజా వార్తలు", language: "te" },
  { category: "technology", query: "టెక్నాలజీ వార్తలు", language: "te" },
  { category: "jobs", query: "ఉద్యోగ ప్రకటనలు నోటిఫికేషన్", language: "te" },
  { category: "cricket", query: "క్రికెట్ వార్తలు", language: "te" },
  { category: "politics", query: "రాజకీయ వార్తలు", language: "te" },
  { category: "health", query: "ఆరోగ్య చిట్కాలు", language: "te" },
  { category: "business", query: "బంగారం ధరలు స్టాక్ మార్కెట్", language: "te" },
  { category: "devotional", query: "భక్తి పూజ రాశిఫలాలు", language: "te" },

  // English feeds (en)
  { category: "andhra-pradesh", query: "Andhra Pradesh news breaking", language: "en" },
  { category: "telangana", query: "Telangana news breaking", language: "en" },
  { category: "cinema", query: "Bollywood Tollywood entertainment movie", language: "en" },
  { category: "vizag", query: "Visakhapatnam news development", language: "en" },
  { category: "technology", query: "technology trends gadgets AI science", language: "en" },
  { category: "jobs", query: "careers jobs hiring vacancies", language: "en" },
  { category: "cricket", query: "cricket match series update", language: "en" },
  { category: "politics", query: "Indian politics government elections", language: "en" },
  { category: "health", query: "health tips wellness nutrition lifestyle", language: "en" },
  { category: "business", query: "stock market gold silver business finance", language: "en" },
  { category: "devotional", query: "spirituality temples festivals astrology", language: "en" },

  // Hindi feeds (hi)
  { category: "andhra-pradesh", query: "आं‍ध्र प्रदेश समाचार", language: "hi" },
  { category: "telangana", query: "तेलंगाना मुख्य समाचार", language: "hi" },
  { category: "cinema", query: "बॉलीवुड सिनेमा मनोरंजन", language: "hi" },
  { category: "vizag", query: "विशाखापट्टनम समाचार", language: "hi" },
  { category: "technology", query: "टेक्नोलॉजी तकनीक गैजेट्स", language: "hi" },
  { category: "jobs", query: "सरकारी नौकरी रोजगार वैकेंसी", language: "hi" },
  { category: "cricket", query: "क्रिकेट खेल समाचार", language: "hi" },
  { category: "politics", query: "राजनीति चुनाव सरकार", language: "hi" },
  { category: "health", query: "स्वास्थ्य टिप्स घरेलू नुस्खे", language: "hi" },
  { category: "business", query: "शेयर बाजार सोना चांदी व्यापार", language: "hi" },
  { category: "devotional", query: "भक्ति आरती मंदिर राशिफल", language: "hi" },

  // Tamil feeds (ta)
  { category: "andhra-pradesh", query: "ஆந்திர செய்திகள்", language: "ta" },
  { category: "telangana", query: "தெலுங்கானா செய்திகள்", language: "ta" },
  { category: "cinema", query: "சினிமா செய்திகள் கோலிவுட்", language: "ta" },
  { category: "vizag", query: "விசாகப்பட்டினம் செய்திகள்", language: "ta" },
  { category: "technology", query: "தொழில்நுட்பம் மொபைல் கேஜெட்ஸ்", language: "ta" },
  { category: "jobs", query: "வேலைவாய்ப்பு அரசு வேலைகள்", language: "ta" },
  { category: "cricket", query: "கிரிக்கெட் விளையாட்டு செய்திகள்", language: "ta" },
  { category: "politics", query: "அரசியல் தேர்தல் செய்திகள்", language: "ta" },
  { category: "health", query: "ஆரோக்கிய குறிப்புகள் நலம்", language: "ta" },
  { category: "business", query: "பங்குச்சந்தை தங்கம் வெள்ளி விலை", language: "ta" },
  { category: "devotional", query: "ஆன்மீகம் பக்தி ஜோதிடம்", language: "ta" },

  // Kannada feeds (kn)
  { category: "andhra-pradesh", query: "ಆಂಧ್ರ ಪ್ರದೇಶ ಸುದ್ದಿ", language: "kn" },
  { category: "telangana", query: "ತೆಲಂಗಾಣ ಸುದ್ದಿ", language: "kn" },
  { category: "cinema", query: "ಸಿನಿಮಾ ಸುದ್ದಿ ಸ್ಯಾಂಡಲ್‌ವುಡ್", language: "kn" },
  { category: "vizag", query: "ವಿಶಾಖಪಟಣ ಸುದ್ದಿ", language: "kn" },
  { category: "technology", query: "ತಂತ್ರಜ್ಞಾನ ಮೊಬೈಲ್ ಗ್ಯಾಜೆಟ್ಸ್", language: "kn" },
  { category: "jobs", query: "ಉದ್ಯೋಗ ಮಾಹಿತಿ ಸರ್ಕಾರಿ ಕೆಲಸ", language: "kn" },
  { category: "cricket", query: "ಕ್ರಿಕೆಟ್ ಕ್ರೀಡಾ ಸುದ್ದಿ", language: "kn" },
  { category: "politics", query: "ರಾಜಕೀಯ ಚುನಾವಣೆ ಸುದ್ದಿ", language: "kn" },
  { category: "health", query: "ಆರೋಗ್ಯ ಸಲಹೆಗಳು ಮನೆಮದ್ದು", language: "kn" },
  { category: "business", query: "ಷೇರು ಮಾರುಕಟ್ಟೆ ಚಿன்னದ ಬೆಲೆ", language: "kn" },
  { category: "devotional", query: "ಭಕ್ತಿ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಯೋತಿಷ್ಯ", language: "kn" }
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
    const dashMatch = itemTitle.match(/[-–—]\s*([^\-–—]+)\s*$/);
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

    const result = await model.generateContent(prompt);
    const textRes = result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
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
    console.error("Gemini image validation errored, reverting to safe check:", error.message);
    return {
      relevance_score: 50,
      person_match_score: 50,
      quality_score: 50,
      safety_score: 100,
      clickbait_score: 50,
      decision: "reject",
      reason: "Gemini analysis error fallback"
    };
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
  "andhra-pradesh": "/images/ap-fallback.jpg",
  "telangana": "/images/telangana-fallback.jpg",
  "cinema": "/images/cinema-fallback.jpg",
  "vizag": "/images/vizag-fallback.jpg",
  "technology": "/images/tech-fallback.jpg",
  "jobs": "/images/jobs-fallback.jpg",
  "cricket": "/images/cricket-fallback.jpg",
  "politics": "/images/politics-fallback.jpg"
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
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `
          You are VaartaNow, a leading regional digital news desk.
          Rewrite the following news item into three premium, distinct levels of Telugu summaries with key locations, timelines, and facts highlighted.
          
          RSS Title: "${item.title}"
          Category: "${feed.category}"
          Link: "${item.link}"

          Generate these specific formats:
          1. summary_short: An engaging, high-impact one-liner.
          2. summary_medium: 1-2 paragraphs highlighting the immediate news event.
          3. summary_long: A rich, highly comprehensive summary consisting of 4 to 8 paragraphs. Call out key facts, timeline of events, important names, geographical coordinates/locations, and previous context.

          Ensure strict adherence to facts without any hallucination. Return ONLY valid JSON matching this schema:
          {
            "title": "Telugu headline",
            "excerpt": "Brief snippet description",
            "content": "Full markdown-rich article body",
            "tags": ["array", "of", "relevant", "tags"],
            "meta_title": "SEO Meta Title",
            "meta_description": "SEO Meta Description",
            "reading_time_min": 3,
            "featured": false,
            "summary_short": "String short",
            "summary_medium": "String medium",
            "summary_long": "String long"
          }
          `;
          
          const result = await model.generateContent(prompt);
          const response = result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
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
          
          // Setup candidates array to follow step-by-step extraction prioritizations
          const imageCandidates: string[] = [];
          
          // 1. Fetch RSS enclosures / content thumbnails
          if (item.enclosure?.url) {
            imageCandidates.push(item.enclosure.url);
          }
          
          // 2. Fetch OG metadata/publisher images
          if (item.link) {
            const ogImg = await fetchOgImage(item.link);
            if (ogImg) imageCandidates.push(ogImg);
          }

          let chosenImageUrl = CATEGORY_PLACEHOLDERS[feed.category] || "/images/placeholder.jpg";
          let validationReport: ImageValidationReport = {
            relevance_score: 100,
            person_match_score: 100,
            quality_score: 100,
            safety_score: 100,
            clickbait_score: 0,
            decision: "approve",
            reason: "Default fallback category banner approved."
          };
          let sourceValidationStatus = "trusted";

          // Process candidates sequentially to apply Source & Gemini validation
          const publisherDomain = new URL(item.link || "https://google.com").hostname.replace("www.", "");

          for (const imgUrl of imageCandidates) {
            console.log(`\nEvaluating candidate image: ${imgUrl.slice(0, 75)}...`);
            
            // Step 1: Source Validation
            const sourceCheck = validateImageSource(imgUrl, publisherDomain);
            if (sourceCheck.status === "reject") {
              console.log(`  ✗ Rejected by Source validation: ${sourceCheck.reason}`);
              continue;
            }
            
            // Step 2: Gemini Image Validation
            const geminiCheck = await validateImageWithGemini(imgUrl, ai.title || item.title, ai.summary_medium || item.title, feed.category);
            console.log(`  📊 Gemini Validation - Relevance: ${geminiCheck.relevance_score}, Quality: ${geminiCheck.quality_score}, Safety: ${geminiCheck.safety_score}, Clickbait: ${geminiCheck.clickbait_score}`);
            
            if (geminiCheck.decision === "approve") {
              chosenImageUrl = imgUrl;
              validationReport = geminiCheck;
              sourceValidationStatus = sourceCheck.status;
              console.log("  ✓ Candidate APPROVED!");
              break;
            } else {
              console.log(`  ✗ Candidate REJECTED by Gemini: ${geminiCheck.reason}`);
            }
          }

          // If no custom image passed validation, use default category placeholder
          if (chosenImageUrl.startsWith("/images/") || !chosenImageUrl) {
            chosenImageUrl = CATEGORY_PLACEHOLDERS[feed.category] || "/images/placeholder.jpg";
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
            console.warn("  ⚠ Supabase schema is missing new validation/metadata columns. Retrying safe insert with fallback columns...");
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
      }
    } catch (e) {
      console.error(`Error processing feed ${feed.category}:`, e);
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  console.log("Ingestion process complete.");
}

run();
