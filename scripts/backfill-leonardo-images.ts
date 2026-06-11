import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

// Load .env
try {
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
} catch {}

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey = process.env.GEMINI_API_KEY!;

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
const genAI = new GoogleGenerativeAI(geminiKey);

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
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `
    Analyze if the following image candidate matches the news article content.
    ARTICLE HEADLINE: "${headline}"
    ARTICLE CATEGORY: "${category}"
    ARTICLE SUMMARY: "${summary}"
    IMAGE URL: "${imageUrl}"

    Return ONLY a valid JSON object matching this schema:
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
    const isApproved = 
      report.relevance_score >= 80 &&
      report.quality_score >= 75 &&
      report.safety_score >= 90 &&
      report.clickbait_score <= 20;

    return { ...report, decision: isApproved ? "approve" : "reject" };
  } catch {
    return { relevance_score: 50, person_match_score: 50, quality_score: 50, safety_score: 100, clickbait_score: 50, decision: "reject", reason: "Analysis failure fallback" };
  }
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
    let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
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

async function uploadImageToSupabase(imageUrl: string, fileNamePrefix: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) return null;
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

    if (uploadError) return null;

    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch {
    return null;
  }
}



async function backfill() {
  console.log("=".repeat(60));
  console.log("🔄 Upgrading to Validated Publisher Photos");
  console.log("=".repeat(60));

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, og_image, content, category")
    .or("og_image.is.null,og_image.ilike.%pollinations%,og_image.ilike.%localhost%,og_image.ilike.%googleusercontent%")
    .order("published_at", { ascending: false });

  if (error || !posts) {
    console.error("Failed to fetch posts:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${posts.length} articles to upgrade.\n`);

  const targetPosts = posts.slice(0, 10);
  let updated = 0;

  for (const post of targetPosts) {
    console.log(`\nProcessing: "${post.title.slice(0, 50)}..." [${post.slug}]`);
    let newImage: string | null = null;
    
    const linkMatch = post.content?.match(/\[Google News\]\((https:\/\/[^\s\)]+)\)/i) || 
                      post.content?.match(/📺 Live Video:\s*(https:\/\/[^\s\)]+)/i);
    const articleUrl = linkMatch?.[1];

    if (articleUrl) {
      console.log(`  🔍 Fetching original publisher image: ${articleUrl}`);
      newImage = await fetchOgImage(articleUrl);
    }

    let payload: any = null;

    if (newImage) {
      const check = await validateImageWithGemini(newImage, post.title, post.excerpt || post.title, post.category);
      if (check.decision === "approve") {
        payload = {
          og_image: newImage,
          image_validation_status: "approve",
          image_validation_reason: check.reason,
          relevance_score: check.relevance_score,
          quality_score: check.quality_score,
          safety_score: check.safety_score,
          clickbait_score: check.clickbait_score,
          validated_at: new Date().toISOString()
        };
      } else {
        console.log(`  ✗ Publisher image rejected by Gemini: ${check.reason}`);
      }
    }

    if (!payload) {
      console.log('  ⚠ No valid publisher image found. Skipping article.');
      continue;
    }

    if (payload) {
      let { error: updateErr } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", post.id);

      if (updateErr && updateErr.message.includes("Could not find the") && updateErr.message.includes("column")) {
        console.warn("  ⚠ Supabase schema is missing new validation/metadata columns. Retrying safe update...");
        const safePayload = {
          og_image: payload.og_image
        };
        const retryRes = await supabase
          .from("blog_posts")
          .update(safePayload)
          .eq("id", post.id);
        updateErr = retryRes.error;
      }

      if (!updateErr) {
        console.log(`  ✓ Cover banner updated successfully: ${payload.og_image}`);
        updated++;
      } else {
        console.error(`  ✗ Database update failed:`, updateErr.message);
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Backfill complete! Upgraded ${updated} cover images.`);
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}

backfill().catch(e => { console.error(e); process.exit(1); });
