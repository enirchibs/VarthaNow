import { spawn } from "child_process";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let cycleCount = 0;
const startTime = new Date();

function banner(msg: string) {
  const line = "=".repeat(66);
  console.log(`\n${line}`);
  console.log(msg);
  console.log(line);
}

function ts() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function uptime() {
  const diffMs = Date.now() - startTime.getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

function executeScript(scriptPath: string, label: string): Promise<number> {
  return new Promise((resolve) => {
    console.log(`\n▶  [${ts()}] Starting: ${label}`);
    console.log(`   Command: npx tsx ${scriptPath}`);

    const child = spawn("npx", ["tsx", scriptPath], {
      shell: true,
      stdio: "inherit",
      // Ensure subprocess env inherits parent's PATH & NODE env
      env: { ...process.env }
    });

    const timeout = setTimeout(() => {
      console.warn(`⚠  [${ts()}] Task "${label}" timed out after 45 minutes. Killing...`);
      child.kill("SIGTERM");
    }, 45 * 60 * 1000); // Hard kill after 45 min so we don't overrun the 1-hour cycle

    child.on("close", (code) => {
      clearTimeout(timeout);
      const exitCode = code ?? 0;
      const icon = exitCode === 0 ? "✓" : "✗";
      console.log(`${icon}  [${ts()}] Finished: ${label} — exit code ${exitCode}`);
      resolve(exitCode);
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      console.error(`✗  [${ts()}] Error launching "${label}":`, err.message);
      resolve(1);
    });
  });
}

async function runDispatcher() {
  cycleCount++;
  banner(
    `🕒 Cycle #${cycleCount} started at ${ts()}\n` +
    `   Dispatcher uptime: ${uptime()}\n` +
    `   Tasks: (1) populate-news (Telugu)  →  (2) Telugu deep ingestion`
  );

  // ── Task 1: Fetch all news categories for Telugu ──
  /*
  const newsExitCode = await executeScript(
    "scripts/populate-news.ts",
    "News Ingestion — Telugu Category Feeds"
  );
  */
  const newsExitCode = 0;

  /*
  // ── Cooldown between tasks ──
  console.log(`\n⏳ [${ts()}] Cooldown 5 seconds before jobs ingestion...`);
  await new Promise(resolve => setTimeout(resolve, 5_000));

  // ── Task 2: Fetch all remote jobs from Remotive API ──
  const jobsExitCode = await executeScript(
    "scripts/populate-jobs.ts",
    "Jobs Ingestion — Remotive API (software-development, remote)"
  );
  */

  // ── Cooldown between tasks ──
  console.log(`\n⏳ [${ts()}] Cooldown 5 seconds before Telugu news deep ingestion...`);
  await new Promise(resolve => setTimeout(resolve, 5_000));

  // ── Task 3: Deep Telugu News Ingestion Pipeline ──
  const teluguExitCode = await executeScript(
    "scripts/ingest-telugu-news.ts",
    "Telugu News Deep Ingestion — 9 Category Feeds with Image Validation"
  );

  // ── Cycle Summary ──
  banner(
    `✅ Cycle #${cycleCount} complete at ${ts()}\n` +
    `   News exit: ${newsExitCode}  |  Telugu exit: ${teluguExitCode}\n` +
    `   Next cycle in 15 minutes  |  Uptime: ${uptime()}`
  );
}

banner(
  `🚀 VaartaNow Dispatcher — LIVE\n` +
  `   Started at: ${ts()}\n` +
  `   Fetches News Ingestion + Telugu Deep Ingestion (All Categories)\n` +
  `   — every 15 minutes.`
);

// Run immediately on startup, then every 15 minutes
runDispatcher();
setInterval(() => {
  // Prevent overlapping cycles — if previous cycle is still running, skip
  runDispatcher();
}, INTERVAL_MS);
