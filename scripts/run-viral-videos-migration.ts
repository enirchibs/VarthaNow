import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

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

if (!supabaseUrl || !serviceRole) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in env!");
  process.exit(1);
}

const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
console.log("Supabase Project Ref:", projectRef);

async function applyMigration() {
  const sqlPath = path.join(process.cwd(), "supabase/migrations/20260612000000_create_viral_videos.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ SQL migration file not found at: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log("Applying database migration to create public.viral_videos table...");

  const metaRes = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceRole,
      "Authorization": `Bearer ${serviceRole}`
    },
    body: JSON.stringify({ sql })
  });

  if (metaRes.ok) {
    console.log("✅ Migration applied successfully!");
    return true;
  }

  const errText = await metaRes.text();
  console.warn("Direct RPC exec_sql attempt failed:", metaRes.status, errText);
  console.log("\n=== RUN THIS MANUALLY IN SUPABASE SQL EDITOR ===");
  console.log(sql);
  console.log(`URL: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log("=================================================\n");
  return false;
}

applyMigration().then(success => process.exit(success ? 0 : 1));
