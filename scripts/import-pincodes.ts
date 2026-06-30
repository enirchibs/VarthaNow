import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Load environment variables from .env
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
} catch {
  console.log("Relying on system environment variables");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing Supabase URL or Service Role Key!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function startImport() {
  const filePath = path.join(process.cwd(), "india pincodes.csv");
  if (!fs.existsSync(filePath)) {
    console.error("❌ 'india pincodes.csv' not found in project root directory!");
    process.exit(1);
  }

  console.log("📂 Reading 'india pincodes.csv'...");
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 1000;
  let header: string[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    const parsed = parseCsvLine(line);
    
    // First line is header
    if (count === 0) {
      header = parsed.map(h => h.toLowerCase());
      count++;
      continue;
    }

    // Mapping headers to values:
    // circlename,regionname,divisionname,officename,pincode,officetype,delivery,district,statename,latitude,longitude
    const circle = parsed[0] || "";
    const region = parsed[1] || "";
    const division = parsed[2] || "";
    const office_name = parsed[3] || "";
    const pincode = parsed[4] || "";
    const office_type = parsed[5] || "";
    const delivery_status = parsed[6] || "";
    const district = parsed[7] || "";
    const state = parsed[8] || "";
    
    const rawLat = parsed[9];
    const rawLng = parsed[10];

    const latitude = (!rawLat || rawLat.toUpperCase() === "NA") ? null : parseFloat(rawLat);
    const longitude = (!rawLng || rawLng.toUpperCase() === "NA") ? null : parseFloat(rawLng);

    // Skip rows missing mandatory data
    if (!pincode || !office_name || !district || !state) {
      continue;
    }

    batch.push({
      pincode,
      office_name,
      delivery_status,
      division,
      region,
      circle,
      district,
      state,
      latitude,
      longitude,
      country: "India",
      timezone: "Asia/Kolkata",
      source: "India Post"
    });

    if (batch.length >= BATCH_SIZE) {
      const currentBatch = [...batch];
      batch = [];
      await uploadBatch(currentBatch, count);
    }
    
    count++;
  }

  // Upload remaining
  if (batch.length > 0) {
    await uploadBatch(batch, count);
  }

  console.log(`\n🎉 Ingestion complete! Total lines parsed: ${count}`);
  
  // Refresh Materialized View after importing
  console.log("⚡ Refreshing search materialized view...");
  const { error: refreshErr } = await supabase.rpc("refresh_location_search");
  if (refreshErr) {
    console.error("❌ Failed to refresh materialized view:", refreshErr.message);
  } else {
    console.log("✅ Materialized view refreshed successfully!");
  }
}

async function uploadBatch(rows: any[], count: number) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const { error } = await supabase.from("india_post_locations").insert(rows);
      if (error) throw error;
      console.log(`📤 Uploaded batch up to row ${count}...`);
      return;
    } catch (err: any) {
      attempts++;
      console.warn(`⚠ Batch upload failed (Attempt ${attempts}/${maxAttempts}): ${err.message || err}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error(`❌ Failed to upload batch up to row ${count} after max retries.`);
}

startImport().catch(err => {
  console.error("❌ Critical migration script failure:", err);
});
