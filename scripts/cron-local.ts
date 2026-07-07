import { spawn } from "child_process";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Dynamic Priority Scheduler v2.0
//  No hardcoded inter-feed delays. Each category runs in its own
//  independent cycle. AI/Social/Sitemap workers run truly async.
// ═══════════════════════════════════════════════════════════════════

interface CategoryConfig {
  category: string;
  priority: number;
  currentIntervalMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  lastPolledAt: number;
  errorStreak: number;
  consecutiveEmpty: number;
  isRunning: boolean; // prevent overlapping runs
}

// ─── CATEGORY SCHEDULE CONFIGURATION ─────────────────────────────
// P1: Critical — Politics, Breaking, National
// P2: High — AP, Telangana, Business, Cricket
// P3: Medium — Cinema, Tech, Jobs, Health, Education
// P4: Low — Devotional, Agriculture, Astrology
const categories: CategoryConfig[] = [
  // P1 — Default 2min, min 1min, max 5min
  { category: "politics",      priority: 1, currentIntervalMs: 2*60000,  minIntervalMs: 60000,    maxIntervalMs: 5*60000,   lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "national",      priority: 1, currentIntervalMs: 2*60000,  minIntervalMs: 60000,    maxIntervalMs: 5*60000,   lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },

  // P2 — Default 5min, min 2min, max 15min
  { category: "andhra-pradesh",priority: 2, currentIntervalMs: 5*60000,  minIntervalMs: 2*60000,  maxIntervalMs: 15*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "telangana",     priority: 2, currentIntervalMs: 5*60000,  minIntervalMs: 2*60000,  maxIntervalMs: 15*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "cricket",       priority: 2, currentIntervalMs: 5*60000,  minIntervalMs: 2*60000,  maxIntervalMs: 15*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "business",      priority: 2, currentIntervalMs: 5*60000,  minIntervalMs: 2*60000,  maxIntervalMs: 15*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },

  // P3 — Default 20min, min 10min, max 45min
  { category: "cinema",        priority: 3, currentIntervalMs: 20*60000, minIntervalMs: 10*60000, maxIntervalMs: 45*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "technology",    priority: 3, currentIntervalMs: 20*60000, minIntervalMs: 10*60000, maxIntervalMs: 45*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "jobs",          priority: 3, currentIntervalMs: 25*60000, minIntervalMs: 10*60000, maxIntervalMs: 60*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "health",        priority: 3, currentIntervalMs: 25*60000, minIntervalMs: 15*60000, maxIntervalMs: 60*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "education",     priority: 3, currentIntervalMs: 30*60000, minIntervalMs: 15*60000, maxIntervalMs: 60*60000,  lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },

  // P4 — Default 45min, min 30min, max 120min
  { category: "devotional",    priority: 4, currentIntervalMs: 45*60000, minIntervalMs: 30*60000, maxIntervalMs: 120*60000, lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "agriculture",   priority: 4, currentIntervalMs: 60*60000, minIntervalMs: 30*60000, maxIntervalMs: 120*60000, lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
  { category: "astrology",     priority: 4, currentIntervalMs: 60*60000, minIntervalMs: 30*60000, maxIntervalMs: 120*60000, lastPolledAt: 0, errorStreak: 0, consecutiveEmpty: 0, isRunning: false },
];

const startTime = new Date();
let totalCycles = 0;
let totalArticlesInserted = 0;

function ts() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function fmtMs(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

function banner(msg: string) {
  const line = "═".repeat(68);
  console.log(`\n${line}\n${msg}\n${line}`);
}

function uptime() {
  const diff = Date.now() - startTime.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

// ─── SCRIPT EXECUTOR ─────────────────────────────────────────────
function executeScript(scriptPath: string, args: string[], label: string, timeoutMs = 18 * 60 * 1000): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", scriptPath, ...args], {
      shell: true,
      stdio: "inherit",
      env: { ...process.env }
    });

    const timer = setTimeout(() => {
      console.warn(`⚠️  [${ts()}] "${label}" timed out. Killing.`);
      child.kill("SIGTERM");
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      const icon = code === 0 ? "✅" : "❌";
      console.log(`${icon} [${ts()}] Finished: ${label} (exit ${code ?? 0})`);
      resolve(code ?? 0);
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      console.error(`❌ [${ts()}] Launch error "${label}": ${err.message}`);
      resolve(1);
    });
  });
}

// ─── DYNAMIC SELF-TUNER ───────────────────────────────────────────
function tuneInterval(cat: CategoryConfig, inserted: number, failed: number) {
  if (failed > 0) {
    cat.errorStreak++;
    cat.currentIntervalMs = Math.min(cat.maxIntervalMs, Math.round(cat.currentIntervalMs * 1.6));
    console.log(`  [TUNER] ⚠️  "${cat.category}" errors=${failed}. Backoff → ${fmtMs(cat.currentIntervalMs)}`);
  } else {
    cat.errorStreak = 0;
    if (inserted > 0) {
      // Active feed: speed up
      cat.consecutiveEmpty = 0;
      cat.currentIntervalMs = Math.max(cat.minIntervalMs, Math.round(cat.currentIntervalMs * 0.72));
      console.log(`  [TUNER] 🔥 "${cat.category}" active (${inserted} new). Speed up → ${fmtMs(cat.currentIntervalMs)}`);
      totalArticlesInserted += inserted;
    } else {
      // Quiet: slow down gradually
      cat.consecutiveEmpty++;
      if (cat.consecutiveEmpty >= 3) {
        cat.currentIntervalMs = Math.min(cat.maxIntervalMs, Math.round(cat.currentIntervalMs * 1.3));
        console.log(`  [TUNER] 😴 "${cat.category}" quiet ${cat.consecutiveEmpty}x. Slow down → ${fmtMs(cat.currentIntervalMs)}`);
      }
    }
  }
}

// ─── INGESTION SCHEDULER LOOP ────────────────────────────────────
async function runIngestScheduler() {
  const now = Date.now();

  for (const cat of categories) {
    // Skip if already running (prevent overlapping)
    if (cat.isRunning) continue;

    // Check if this category is due
    if (now - cat.lastPolledAt < cat.currentIntervalMs) continue;

    cat.lastPolledAt = now;
    cat.isRunning = true;
    totalCycles++;

    console.log(`\n🔔 [SCHEDULER][P${cat.priority}] "${cat.category.toUpperCase()}" — interval=${fmtMs(cat.currentIntervalMs)}`);

    // Run ingestion (non-blocking — scheduler continues checking others)
    executeScript(
      "scripts/ingest-telugu-news.ts",
      ["--category", cat.category],
      `Ingest: ${cat.category}`,
      12 * 60 * 1000 // 12 min timeout per category
    ).then(exitCode => {
      cat.isRunning = false;

      // Read stats for self-tuning
      try {
        if (fs.existsSync("scratch/latest_ingest_stats.json")) {
          const raw = fs.readFileSync("scratch/latest_ingest_stats.json", "utf8");
          const s = JSON.parse(raw);
          if (s.category?.toLowerCase() === cat.category.toLowerCase()) {
            tuneInterval(cat, s.inserted || 0, exitCode !== 0 ? 1 : (s.failed || 0));
          }
        }
      } catch {}
    }).catch(() => { cat.isRunning = false; });
  }
}

// ─── STATUS DASHBOARD (logged every 10 min) ──────────────────────
function printStatus() {
  console.log(`\n📊 [STATUS] ${ts()} — Uptime: ${uptime()} — Cycles: ${totalCycles} — Articles: ${totalArticlesInserted}`);
  const nextPolls = categories
    .map(c => ({
      cat: c.category,
      priority: c.priority,
      nextIn: Math.max(0, Math.round((c.currentIntervalMs - (Date.now() - c.lastPolledAt)) / 1000)),
      interval: fmtMs(c.currentIntervalMs),
      running: c.isRunning
    }))
    .sort((a, b) => a.priority - b.priority || a.nextIn - b.nextIn);

  for (const p of nextPolls) {
    const status = p.running ? "🔄 RUNNING" : `next in ${p.nextIn}s`;
    console.log(`   P${p.priority} ${p.cat.padEnd(16)} ${p.interval.padEnd(6)} [${status}]`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  STARTUP
// ═══════════════════════════════════════════════════════════════════

banner(
  `🚀 VaartaNow Dynamic Scheduler v2.0 — ONLINE\n` +
  `   Started: ${ts()}\n` +
  `   ${categories.length} categories · Independent per-category workers\n` +
  `   AI · Social · Sitemap run fully async in background threads`
);

// ─── Main scheduler tick (every 10 seconds) ───────────────────────
setInterval(() => { runIngestScheduler(); }, 10_000);

// ─── AI Queue Worker (every 90 seconds, truly async) ─────────────
let aiWorkerRunning = false;
setInterval(async () => {
  if (aiWorkerRunning) return;
  aiWorkerRunning = true;
  console.log(`\n🤖 [AI QUEUE] ${ts()}`);
  await executeScript("scripts/process-ai-queue.ts", [], "AI Queue Worker", 10 * 60 * 1000)
    .finally(() => { aiWorkerRunning = false; });
}, 90_000);

// ─── Social Post Worker (every 5 minutes) ───────────────────────
let socialRunning = false;
setInterval(async () => {
  if (socialRunning) return;
  socialRunning = true;
  await executeScript("scripts/social-post-worker.ts", [], "Social Post Worker", 5 * 60 * 1000)
    .finally(() => { socialRunning = false; });
}, 5 * 60_000);

// ─── Sitemap Regeneration (every 8 minutes) ──────────────────────
let sitemapRunning = false;
setInterval(async () => {
  if (sitemapRunning) return;
  sitemapRunning = true;
  console.log(`\n🗺️  [SITEMAP] ${ts()}`);
  await executeScript("scripts/generate-sitemap.ts", [], "Sitemap Generator", 3 * 60 * 1000)
    .finally(() => { sitemapRunning = false; });
}, 8 * 60_000);

// ─── YouTube Shorts (every 30 minutes) ──────────────────────────
let ytRunning = false;
setInterval(async () => {
  if (ytRunning) return;
  ytRunning = true;
  await executeScript("scripts/ingest-youtube-shorts.ts", [], "YouTube Shorts", 8 * 60 * 1000)
    .finally(() => { ytRunning = false; });
}, 30 * 60_000);

// ─── Status dashboard (every 10 minutes) ─────────────────────────
setInterval(printStatus, 10 * 60_000);

// Kick off immediately on startup
runIngestScheduler();
setTimeout(printStatus, 5000);
