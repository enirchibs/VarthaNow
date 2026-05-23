import { spawn } from "child_process";

console.log("==================================================================");
console.log("🚀 VarthaNow Local Background Cron Job Active");
console.log("Articles will be scraped, generated, and published every 15 minutes.");
console.log("==================================================================");

function runScraper() {
  const timestamp = new Date().toLocaleString();
  console.log(`\n[${timestamp}] Starting scheduled news ingestion...`);
  
  const child = spawn("npx", ["tsx", "scripts/populate-news.ts"], { 
    shell: true, 
    stdio: "inherit" 
  });
  
  child.on("close", (code) => {
    const finishedTimestamp = new Date().toLocaleString();
    console.log(`[${finishedTimestamp}] Ingestion finished. Next run in 15 minutes.\n`);
  });
}

// Trigger immediately on startup
runScraper();

// Trigger every 15 minutes (15 * 60 * 1000 ms)
setInterval(runScraper, 15 * 60 * 1000);
