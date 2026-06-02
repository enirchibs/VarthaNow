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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

async function checkImages() {
  console.log("Querying blog posts...");
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, category, og_image, published_at")
    .order("published_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  console.log("Recent posts and their images:");
  posts.forEach((post, i) => {
    console.log(`\n[${i+1}] Title: ${post.title}`);
    console.log(`    Category: ${post.category}`);
    console.log(`    og_image: ${post.og_image}`);
  });
}

checkImages();
