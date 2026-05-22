import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";

const siteUrl = process.env.VITE_SITE_URL ?? "https://varthanow.com";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

const staticRoutes = [
  "/",
  "/search",
  "/category/andhra-pradesh",
  "/category/telangana",
  "/category/cinema",
  "/category/vizag",
  "/category/technology",
  "/category/jobs",
  "/category/cricket",
  "/category/politics"
];

async function main() {
  const urls = [...staticRoutes];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from("blog_posts").select("slug").eq("published", true).order("published_at", { ascending: false });
    if (error) throw error;
    urls.push(...(data ?? []).map((post) => `/news/${post.slug}`));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((route) => `  <url><loc>${siteUrl}${route}</loc><changefreq>hourly</changefreq><priority>${route === "/" ? "1.0" : "0.8"}</priority></url>`)
    .join("\n")}\n</urlset>\n`;

  await fs.writeFile("public/sitemap.xml", xml);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
