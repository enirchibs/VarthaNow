import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import * as fsSync from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Sitemap Generator v2.0
//  Generates Google News sitemap XML with <news:news> elements
//  Pings Google + Bing after generation
//  Also processes sitemap pipeline_jobs (immediate ping on breaking news)
// ═══════════════════════════════════════════════════════════════════

try {
  const envText = fsSync.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && val) process.env[key] = val;
  }
} catch {}

const siteUrl = (process.env.VITE_SITE_URL ?? "https://vaartanow.com").replace(/\/$/, "");
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

const STATIC_ROUTES = [
  { url: "/", changefreq: "always", priority: "1.0" },
  { url: "/search", changefreq: "hourly", priority: "0.8" },
  { url: "/category/politics", changefreq: "always", priority: "0.95" },
  { url: "/category/andhra-pradesh", changefreq: "always", priority: "0.95" },
  { url: "/category/telangana", changefreq: "always", priority: "0.95" },
  { url: "/category/national", changefreq: "always", priority: "0.9" },
  { url: "/category/cricket", changefreq: "hourly", priority: "0.9" },
  { url: "/category/business", changefreq: "hourly", priority: "0.85" },
  { url: "/category/cinema", changefreq: "hourly", priority: "0.85" },
  { url: "/category/technology", changefreq: "daily", priority: "0.8" },
  { url: "/category/jobs", changefreq: "daily", priority: "0.8" },
  { url: "/category/health", changefreq: "daily", priority: "0.75" },
  { url: "/category/education", changefreq: "daily", priority: "0.75" },
  { url: "/category/devotional", changefreq: "daily", priority: "0.7" },
  { url: "/category/viralshorts", changefreq: "hourly", priority: "0.8" },
  { url: "/category/vizag", changefreq: "hourly", priority: "0.8" },
];

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function pingSearchEngines(sitemapUrl: string) {
  const engines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  for (const pingUrl of engines) {
    try {
      const res = await fetch(pingUrl, {
        method: "GET",
        signal: AbortSignal.timeout(10_000)
      });
      const engine = pingUrl.includes("google") ? "Google" : "Bing";
      console.log(`  🔔 Pinged ${engine}: ${res.status === 200 ? "✅ OK" : `⚠️ ${res.status}`}`);
    } catch (e: any) {
      console.warn(`  ⚠️  Ping failed: ${e.message}`);
    }
  }
}

async function processSitemapJobs(supabase: any) {
  try {
    const { data: jobs } = await supabase
      .from("pipeline_jobs")
      .select("id, post_slug")
      .eq("job_type", "sitemap")
      .eq("status", "pending")
      .limit(20);

    if (jobs && jobs.length > 0) {
      console.log(`  📋 Processing ${jobs.length} sitemap jobs (breaking news pings)`);
      for (const job of jobs) {
        await supabase.from("pipeline_jobs").update({
          status: "done",
          completed_at: new Date().toISOString()
        }).eq("id", job.id);

        await supabase.from("blog_posts").update({ sitemap_pinged: true }).eq("slug", job.post_slug);
      }
    }
  } catch {}
}

async function main() {
  console.log("🗺️  VaartaNow Sitemap Generator v2.0 — STARTED");

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Process any pending sitemap jobs
  await processSitemapJobs(supabase);

  // Fetch published articles (most recent 5000)
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug, title, og_image, category, published_at, relevance_score, author_name")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error(`❌ Supabase error: ${error.message}`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const articleCount = posts?.length ?? 0;
  console.log(`  📰 ${articleCount} published articles found`);

  // ── Build News Sitemap XML ───────────────────────────────────────
  // Using Google News Sitemap format (https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const staticXml = STATIC_ROUTES.map(r =>
    `  <url>\n    <loc>${escapeXml(siteUrl + r.url)}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n    <lastmod>${now}</lastmod>\n  </url>`
  ).join("\n");

  const articleXml = (posts || []).map(post => {
    const url = `${siteUrl}/${post.category}/${post.slug}`;
    const pubDate = post.published_at ? new Date(post.published_at).toISOString() : now;
    const isRecent = new Date(post.published_at) > twoHoursAgo;
    const isToday = new Date(post.published_at) > oneDayAgo;
    const priority = post.relevance_score >= 80 ? "0.95" : post.relevance_score >= 60 ? "0.85" : isToday ? "0.75" : "0.6";
    const changefreq = isRecent ? "always" : isToday ? "hourly" : "daily";
    const title = escapeXml((post.title || "").slice(0, 100));
    const image = post.og_image?.startsWith("http") ? escapeXml(post.og_image) : "";

    let newsTag = "";
    if (isToday) {
      newsTag = `\n    <news:news>\n      <news:publication>\n        <news:name>VaartaNow</news:name>\n        <news:language>te</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${title}</news:title>\n    </news:news>`;
    }

    let imageTag = "";
    if (image) {
      imageTag = `\n    <image:image>\n      <image:loc>${image}</image:loc>\n      <image:title>${title}</image:title>\n    </image:image>`;
    }

    return `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${pubDate}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${newsTag}${imageTag}\n  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticXml}
${articleXml}
</urlset>
`;

  // Write sitemap
  await fs.writeFile("public/sitemap.xml", xml, "utf8");
  const sizeKb = Math.round(Buffer.byteLength(xml) / 1024);
  console.log(`  ✅ Sitemap written: public/sitemap.xml (${sizeKb}KB, ${articleCount + STATIC_ROUTES.length} URLs)`);

  // Ping search engines (always — they deduplicate on their end)
  await pingSearchEngines(`${siteUrl}/sitemap.xml`);

  console.log("✅  Sitemap generation complete.");
}

main().catch(e => {
  console.error("💀 Sitemap error:", e);
  process.exit(1);
});
