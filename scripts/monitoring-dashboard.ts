import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Monitoring Dashboard
//  Real-time CLI view of pipeline health, queue depth, AI costs
//  Run: npx tsx scripts/monitoring-dashboard.ts
// ═══════════════════════════════════════════════════════════════════

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

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

function box(title: string, lines: string[]) {
  const width = 65;
  const border = "═".repeat(width);
  const sideTop = `╔${border}╗`;
  const sideBot = `╚${border}╝`;
  const titleLine = `║  ${title.padEnd(width - 2)}║`;
  const content = lines.map(l => `║  ${l.padEnd(width - 2)}║`);
  return [sideTop, titleLine, `╠${border}╣`, ...content, sideBot].join("\n");
}

function bar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / Math.max(max, 1)) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function colorNum(n: number, good = 0, warn = 5): string {
  if (n === 0) return `${n}`;
  if (n <= good) return `✅ ${n}`;
  if (n <= warn) return `⚠️  ${n}`;
  return `❌ ${n}`;
}

async function fetchDashboardData() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.allSettled([
    // Articles in last hour
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).gte("published_at", oneHourAgo).eq("published", true),
    // Articles in last 24h
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).gte("published_at", oneDayAgo).eq("published", true),
    // Total articles
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    // AI queue: pending
    supabase.from("pipeline_jobs").select("id", { count: "exact", head: true }).in("status", ["pending", "failed"]),
    // AI queue: processing
    supabase.from("pipeline_jobs").select("id", { count: "exact", head: true }).eq("status", "processing"),
    // AI queue: dead
    supabase.from("pipeline_jobs").select("id", { count: "exact", head: true }).eq("status", "dead"),
    // Completed today
    supabase.from("pipeline_jobs").select("id", { count: "exact", head: true }).eq("status", "done").gte("completed_at", oneDayAgo),
    // By category (last 24h)
    supabase.from("blog_posts").select("category").gte("published_at", oneDayAgo).eq("published", true),
    // AI status distribution
    supabase.from("blog_posts").select("ai_queue_status, social_thumbnail_url").gte("published_at", oneDayAgo),
    // Jobs by type
    supabase.from("pipeline_jobs").select("job_type, status").gte("created_at", oneDayAgo),
    // Recent failures
    supabase.from("pipeline_failures").select("job_type, error, created_at").order("created_at", { ascending: false }).limit(5),
    // Telegram posted today
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("telegram_posted", true).gte("published_at", oneDayAgo),
    // Articles pending AI (old queue)
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).in("social_thumbnail_url", ["pending_ai", "batch_ai"]),
    // High relevance articles (score >= 70) last 24h
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).gte("relevance_score", 70).gte("published_at", oneDayAgo),
    // Images uploaded today
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).not("image_storage_path", "is", null).gte("published_at", oneDayAgo),
  ]);

  const get = (i: number) => (results[i].status === "fulfilled" ? (results[i] as any).value : { count: 0, data: null });

  return {
    articlesLastHour:  get(0).count ?? 0,
    articlesLastDay:   get(1).count ?? 0,
    articlesTotal:     get(2).count ?? 0,
    queuePending:      get(3).count ?? 0,
    queueProcessing:   get(4).count ?? 0,
    queueDead:         get(5).count ?? 0,
    jobsDoneToday:     get(6).count ?? 0,
    categoryData:      get(7).data ?? [],
    aiStatusData:      get(8).data ?? [],
    jobTypeData:       get(9).data ?? [],
    recentFailures:    get(10).data ?? [],
    telegramToday:     get(11).count ?? 0,
    pendingAiOld:      get(12).count ?? 0,
    highImportance:    get(13).count ?? 0,
    imagesUploaded:    get(14).count ?? 0,
  };
}

async function renderDashboard() {
  console.clear();
  const d = await fetchDashboardData();
  const ts = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // ─── Category breakdown ───────────────────────────────────────
  const catCounts: Record<string, number> = {};
  for (const item of d.categoryData) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat, count]) => `    ${cat.padEnd(18)} ${bar(count, d.articlesLastDay, 15)} ${count}`);

  // ─── Job type breakdown ────────────────────────────────────────
  const jobDoneByType: Record<string, number> = {};
  const jobPendingByType: Record<string, number> = {};
  for (const j of d.jobTypeData) {
    if (j.status === "done") jobDoneByType[j.job_type] = (jobDoneByType[j.job_type] || 0) + 1;
    if (["pending","failed"].includes(j.status)) jobPendingByType[j.job_type] = (jobPendingByType[j.job_type] || 0) + 1;
  }

  const jobTypes = ["rewrite", "seo", "tags", "summary", "social", "quality", "sitemap"];
  const jobLines = jobTypes.map(t =>
    `    ${t.padEnd(10)} ✅ done=${String(jobDoneByType[t] || 0).padStart(4)}  ⏳ pending=${String(jobPendingByType[t] || 0).padStart(4)}`
  );

  // ─── AI queue status ──────────────────────────────────────────
  const statusCounts: Record<string, number> = {};
  for (const item of d.aiStatusData) {
    const s = item.ai_queue_status || item.social_thumbnail_url || "unknown";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  // ─── Recent failures ──────────────────────────────────────────
  const failureLines = d.recentFailures.length > 0
    ? d.recentFailures.map((f: any) =>
        `    [${f.job_type?.padEnd(8)}] ${(f.error || "").slice(0, 45)}`)
    : ["    No recent failures ✅"];

  // ─── Render ───────────────────────────────────────────────────
  console.log(box(
    `🚀 VaartaNow Pipeline Monitor — ${ts}`,
    [
      "─── PUBLISHING THROUGHPUT ─────────────────────────────────────",
      `    Last 1 hour:     ${d.articlesLastHour.toString().padStart(5)} articles`,
      `    Last 24 hours:   ${d.articlesLastDay.toString().padStart(5)} articles   (${d.highImportance} high-importance)`,
      `    Total database:  ${d.articlesTotal.toString().padStart(5)} articles`,
      `    Telegram posted: ${d.telegramToday.toString().padStart(5)} today`,
      `    WebP images:     ${d.imagesUploaded.toString().padStart(5)} uploaded today`,
      "",
      "─── AI QUEUE HEALTH ──────────────────────────────────────────",
      `    Pending jobs:    ${colorNum(d.queuePending, 0, 20)}`,
      `    Processing now:  ${d.queueProcessing}`,
      `    Done today:      ${d.jobsDoneToday}`,
      `    Dead (DLQ):      ${colorNum(d.queueDead, 0, 5)}`,
      `    Old queue stuck: ${colorNum(d.pendingAiOld, 0, 10)}`,
      "",
      "─── JOB WORKERS (last 24h) ───────────────────────────────────",
      ...jobLines,
      "",
      "─── ARTICLES BY CATEGORY (last 24h) ─────────────────────────",
      ...topCats,
      "",
      "─── RECENT FAILURES ─────────────────────────────────────────",
      ...failureLines,
      "",
      "─── NOTES ──────────────────────────────────────────────────",
      "    Press Ctrl+C to exit | Refreshes every 30 seconds",
    ]
  ));
}

async function run() {
  const watchMode = process.argv.includes("--watch");

  await renderDashboard();

  if (watchMode) {
    console.log("\n  🔄 Watch mode: refreshing every 30 seconds...");
    setInterval(renderDashboard, 30_000);
  } else {
    process.exit(0);
  }
}

run().catch(e => {
  console.error("Dashboard error:", e);
  process.exit(1);
});
