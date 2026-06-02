import { createClient } from "@supabase/supabase-js";
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
const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

// The VaartaNow logo served from the public folder
// We use an absolute URL so the logo works everywhere (DB, social share, etc.)
const SITE_URL = process.env.VITE_SITE_URL || "http://localhost:3000";
const VAARTANOW_LOGO = `${SITE_URL}/vaartanow-logo.png`;

const FALLBACK_NAMES = [
  "VaartaNow AI Desk",
  "VarthaNow AI Desk",
  "VaartaNow News Desk",
  "VarthaNow News Desk",
  "VaartaNow",
];

async function run() {
  console.log("=".repeat(60));
  console.log("🔄 Updating VaartaNow AI Desk → VaartaNow + brand logo");
  console.log(`   Logo URL: ${VAARTANOW_LOGO}`);
  console.log("=".repeat(60) + "\n");

  let totalUpdated = 0;

  for (const name of FALLBACK_NAMES) {
    const { data, error: fetchErr } = await supabase
      .from("blog_posts")
      .select("id, author_name, source_logo")
      .eq("author_name", name);

    if (fetchErr) {
      console.error(`Failed to fetch for "${name}":`, fetchErr.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`  — No articles with author_name="${name}"`);
      continue;
    }

    console.log(`  Found ${data.length} articles with author_name="${name}", updating...`);

    const { error: updateErr, count } = await supabase
      .from("blog_posts")
      .update({ author_name: "VaartaNow", source_logo: VAARTANOW_LOGO })
      .eq("author_name", name);

    if (updateErr) {
      console.error(`  ✗ Update failed for "${name}":`, updateErr.message);
    } else {
      console.log(`  ✓ Updated ${data.length} articles → author_name="VaartaNow", logo set`);
      totalUpdated += data.length;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Done! Total articles updated: ${totalUpdated}`);
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
