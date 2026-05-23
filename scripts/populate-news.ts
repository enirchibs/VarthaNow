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

const feeds = [
  // Fetching a few feeds for demonstration to avoid rate limits
  { category: "technology", url: "https://news.google.com/rss/search?q=technology+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "cinema", url: "https://news.google.com/rss/search?q=bollywood+tollywood+latest+trending&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "andhra-pradesh", url: "https://news.google.com/rss/search?q=andhra+pradesh+latest+breaking&hl=te&gl=IN&ceid=IN:te", language: "te" },
  { category: "jobs", url: "https://news.google.com/rss/search?q=jobs+careers+hiring&hl=en&gl=IN&ceid=IN:en", language: "en" },
  { category: "cricket", url: "https://news.google.com/rss/search?q=cricket+latest+trending&hl=hi&gl=IN&ceid=IN:hi", language: "hi" }
] as const;

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `news-${Date.now()}`;
}

async function run() {
  console.log("Starting news ingestion...");
  for (const feed of feeds) {
    try {
      console.log(`Fetching RSS for ${feed.category} (${feed.language})...`);
      const rss = await parser.parseURL(feed.url);
      
      const items = (rss.items || []).slice(0, 3); // Get top 3
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
          You are VarthaNow, a professional news editor. Rewrite the following Google News RSS item into an original, copyright-safe SEO article in ${feed.language === "en" ? "English" : feed.language === "te" ? "Telugu" : "Hindi"}.
          Rules:
          - Completely rewrite; do not copy source text.
          - Use natural, professional tone.
          - Include markdown headings and short paragraphs.
          - Return ONLY valid JSON with keys: title, excerpt, content, tags (array of strings), meta_title, meta_description, reading_time_min, image_prompt, featured (boolean). Do not include markdown codeblocks around the JSON.
          
          For key "image_prompt":
          Create a highly descriptive, realistic, and cinematic prompt (2-3 sentences) in English for a text-to-image generator representing the news.
          - If the category or news is about Vizag (Visakhapatnam), describe a scenic photograph of the Visakhapatnam sea corridor, R.K. Beach road overlooking the blue Bay of Bengal, palm trees, coastal highway, or Kailasagiri, with professional lighting.
          - If the category or news is about Telangana, describe Hyderabad landmarks such as the Charminar, Tank Bund with the Hussainsagar lake, Birla Mandir, the new Secretariat building, or the Legislative Assembly, beautiful sunset, highly detailed.
          - If the category or news is about Andhra Pradesh, describe Prakasam Barrage, Tirumala hills, or Amaravati administrative buildings.
          - For other categories, describe a realistic, editorial news photograph representing the event. Always specify 'no text, no logos, no watermarks, realistic photojournalism style'.
          
          RSS item:
          Title: ${item.title}
          Category: ${feed.category}
          `;
          
          const result = await model.generateContent(prompt);
          const response = result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
          ai = JSON.parse(response);
        } catch (geminiError) {
          console.warn("Gemini generation failed, falling back to raw article:", geminiError.message);
          ai = {
            title: item.title,
            excerpt: item.title,
            content: `## ${item.title}\n\nRead more at [Google News](${item.link})`,
            tags: [feed.category, "News"],
            meta_title: item.title,
            meta_description: item.title,
            reading_time_min: 1,
            featured: false,
            image_prompt: ""
          };
        }
        
        try {
          const { error } = await supabase.from("blog_posts").insert({
            slug: baseSlug,
            title: ai.title || item.title,
            excerpt: ai.excerpt || item.title,
            content: ai.content || item.title,
            category: feed.category,
            tags: ai.tags || [feed.category],
            meta_title: ai.meta_title || item.title,
            meta_description: ai.meta_description || item.title,
            og_image: ai.image_prompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(ai.image_prompt)}?width=1200&height=675&nologo=true&private=true` : null,
            author_name: "Google News",
            language: feed.language,
            published: true,
            featured: ai.featured || false,
            reading_time_min: ai.reading_time_min || 1,
            published_at: item.isoDate || new Date().toISOString()
          });

          if (error) {
            console.error("Insert error:", error.message);
          } else {
            console.log(`Inserted successfully: ${ai.title}`);
          }
        } catch (e) {
          console.error("Failed to parse Gemini JSON for", item.title);
        }
      }
    } catch (e) {
      console.error(`Error processing feed ${feed.category}:`, e);
    }
  }
  console.log("Done.");
}

run();
