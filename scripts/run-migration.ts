import * as fs from "fs";
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

const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
console.log("Project ref:", projectRef);

const sql = `
ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS source_image_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS featured_image_url text,
  ADD COLUMN IF NOT EXISTS social_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS summary_short text,
  ADD COLUMN IF NOT EXISTS summary_medium text,
  ADD COLUMN IF NOT EXISTS summary_long text,
  ADD COLUMN IF NOT EXISTS image_validation_status text DEFAULT 'review',
  ADD COLUMN IF NOT EXISTS image_validation_reason text,
  ADD COLUMN IF NOT EXISTS relevance_score integer,
  ADD COLUMN IF NOT EXISTS quality_score integer,
  ADD COLUMN IF NOT EXISTS safety_score integer,
  ADD COLUMN IF NOT EXISTS clickbait_score integer,
  ADD COLUMN IF NOT EXISTS validated_at timestamptz;
`;

async function applyMigration() {
  console.log("Applying database validation and metadata columns migration to public.blog_posts...");
  
  // Directly try using direct POST REST/RPC if the client supports it
  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  
  // Since we cannot run custom DDL via RPC unless exec_sql is defined,
  // we can use standard REST API proxy for DDL if exposed, or try calling a migration via REST.
  // In Supabase, if the user does not have exec_sql, we'll try pg proxy POST with REST:
  
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: "GET",
    headers: {
      "apikey": serviceRole,
      "Authorization": `Bearer ${serviceRole}`
    }
  });
  
  if (res.ok) {
    console.log("API Connection verified.");
  }

  // Let's attempt running the migration via pg-meta endpoint utilizing the service-role JWT
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
    console.log("✅ Migration applied via direct exec_sql REST RPC!");
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
