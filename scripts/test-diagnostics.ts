import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load environment variables
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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function runDiagnostics() {
  console.log("==================================================");
  console.log("🔍 RUNNING VARTHANOW BACKEND DIAGNOSTICS TESTS");
  console.log("==================================================");

  // 1. Supabase Connection Check
  console.log("\n[TEST 1] Testing Supabase DB Connection...");
  try {
    const { data, error } = await supabase.from("blog_posts").select("id").limit(1);
    if (error) throw error;
    console.log("✅ PASS: Successfully queried blog_posts table.");
  } catch (err: any) {
    console.log(`❌ FAIL: Supabase query failed: ${err.message || err}`);
  }

  // 2. Secret Keys Validation Check
  console.log("\n[TEST 2] Verifying Backend Secrets Exist...");
  try {
    const { data, error } = await supabase.functions.invoke("gemini-proxy", {
      body: { action: "validate_secrets" }
    });
    if (error) {
      if (error.context) {
        const text = await error.context.text();
        throw new Error(`${error.message} - Response Body: ${text}`);
      }
      throw error;
    }
    console.log(`✅ PASS: Secrets check completed successfully.`);
    console.log(`   - GEMINI_API_KEY: ${data.gemini ? "Found (Pass)" : "Missing (Fail)"}`);
    console.log(`   - YOUTUBE_API_KEY: ${data.youtube ? "Found (Pass)" : "Missing (Fail)"}`);
  } catch (err: any) {
    console.log(`❌ FAIL: Secrets validation edge function failed: ${err.message || err}`);
  }

  // 3. Gemini 2.5 Flash Generation Check
  console.log("\n[TEST 3] Testing Gemini 2.5 Flash Text Generation...");
  try {
    const { data, error } = await supabase.functions.invoke("gemini-proxy", {
      body: { action: "health_check" }
    });
    if (error) {
      if (error.context) {
        const text = await error.context.text();
        throw new Error(`${error.message} - Response Body: ${text}`);
      }
      throw error;
    }
    console.log(`✅ PASS: Gemini successfully generated a news headline.`);
    console.log(`   - Headline: "${data.headline}"`);
  } catch (err: any) {
    console.log(`❌ FAIL: Gemini generation failed: ${err.message || err}`);
  }

  // 4. YouTube API Ingest Check
  console.log("\n[TEST 4] Testing YouTube API Trending Feed...");
  try {
    const { data, error } = await supabase.functions.invoke("youtube-proxy");
    if (error) {
      if (error.context) {
        const text = await error.context.text();
        throw new Error(`${error.message} - Response Body: ${text}`);
      }
      throw error;
    }
    const items = data.items || [];
    console.log(`✅ PASS: YouTube API successfully fetched trending feed.`);
    console.log(`   - Found: ${items.length} videos`);
    if (items.length > 0) {
      console.log("   - Sample Video Titles:");
      items.slice(0, 3).forEach((item: any, i: number) => {
        console.log(`     ${i + 1}. ${item.snippet?.title} [Channel: ${item.snippet?.channelTitle}]`);
      });
    }
  } catch (err: any) {
    console.log(`❌ FAIL: YouTube API proxy failed: ${err.message || err}`);
  }

  console.log("\n==================================================");
  console.log("🏁 DIAGNOSTICS TESTS CONCLUDED");
  console.log("==================================================");
}

runDiagnostics();
