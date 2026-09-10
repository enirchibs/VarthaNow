import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// GET: Return usage logs, remaining free quotas, and cache stats
export async function GET() {
  const supabase = getSupabase();
  let usageLogs = [];
  let cacheCount = 0;

  if (supabase) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: logs } = await supabase
      .from("tts_usage_logs")
      .select("*")
      .gte("period_start", periodStart);
    usageLogs = logs || [];

    const { count } = await supabase
      .from("tts_audio_cache")
      .select("*", { count: "exact", head: true });
    cacheCount = count || 0;
  }

  return NextResponse.json({
    period: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    usageLogs,
    cacheCount,
  });
}
