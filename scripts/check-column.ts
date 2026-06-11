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

const { data, error } = await supabase
  .from("blog_posts")
  .select("id, title, language, og_image, published_at")
  .order("published_at", { ascending: false })
  .limit(10);

if (error) {
  console.error("Error querying blog posts:", error.message);
} else {
  console.log("Recent Blog Posts:");
  data?.forEach((post) => {
    console.log(`- [${post.language}] ${post.title}\n  Image: ${post.og_image}\n  Published At: ${post.published_at}\n`);
  });
}
process.exit(0);
