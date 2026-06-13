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

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from("viral_videos")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Error querying table:", error);
  } else {
    console.log("Success! Total rows in viral_videos:", data?.length);
    if (data && data.length > 0) {
      console.log("Videos in table:");
      data.forEach((v: any, i: number) => {
        console.log(`  ${i+1}. ${v.title} (${v.video_url})`);
      });
    }
  }
}

test();
