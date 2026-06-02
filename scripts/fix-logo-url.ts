import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

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

// Use a relative path — works on localhost AND in production
const LOGO = "/vaartanow-logo.png";

async function run() {
  console.log("Fixing VaartaNow logo URL to relative path:", LOGO);

  // Fix all rows where source_logo contains localhost (any port) + vaartanow-logo
  const { data, error: fetchErr } = await supabase
    .from("blog_posts")
    .select("id")
    .like("source_logo", "%vaartanow-logo%");

  if (fetchErr) { console.error(fetchErr.message); process.exit(1); }
  console.log(`Found ${data?.length ?? 0} VaartaNow-logo articles to fix.`);

  const { error } = await supabase
    .from("blog_posts")
    .update({ author_name: "VaartaNow", source_logo: LOGO })
    .like("source_logo", "%vaartanow-logo%");

  if (error) { console.error("Update failed:", error.message); process.exit(1); }
  console.log(`✅ Updated ${data?.length ?? 0} articles with relative logo path: ${LOGO}`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
