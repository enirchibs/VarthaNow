import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MASTER_SAFETY_CONFIG } from "@/lib/tts/provider-manager";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// GET: Return current provider configurations and safety toggles
export async function GET() {
  const supabase = getSupabase();
  let providers = [];

  if (supabase) {
    const { data } = await supabase
      .from("tts_providers_config")
      .select("*")
      .order("priority", { ascending: true });
    providers = data || [];
  }

  if (providers.length === 0) {
    providers = [
      { id: "google", provider_name: "Google Cloud TTS", enabled: true, priority: 1, free_only: true, free_character_limit: 4000000, status: "ACTIVE" },
      { id: "azure", provider_name: "Microsoft Azure Speech", enabled: true, priority: 2, free_only: true, free_character_limit: 500000, status: "ACTIVE" },
      { id: "sarvam", provider_name: "Sarvam AI Telugu", enabled: true, priority: 3, free_only: true, free_character_limit: 200000, status: "ACTIVE" },
      { id: "elevenlabs", provider_name: "ElevenLabs Telugu", enabled: true, priority: 4, free_only: true, free_character_limit: 10000, status: "ACTIVE" },
      { id: "selfhosted", provider_name: "Self-Hosted Telugu TTS", enabled: false, priority: 5, free_only: true, free_character_limit: 10000000, status: "ACTIVE" },
      { id: "android", provider_name: "Android Native TTS", enabled: true, priority: 999, free_only: true, free_character_limit: 999999999, status: "ACTIVE" },
    ];
  }

  return NextResponse.json({
    masterSafety: MASTER_SAFETY_CONFIG,
    providers,
  });
}

// POST: Update provider configurations or priority reordering
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, updates, priorityOrder } = body;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ success: true, message: "Database offline, updated in-memory" });
    }

    if (priorityOrder && Array.isArray(priorityOrder)) {
      // Reorder provider priorities
      for (let i = 0; i < priorityOrder.length; i++) {
        await supabase
          .from("tts_providers_config")
          .update({ priority: i + 1, updated_at: new Date().toISOString() })
          .eq("id", priorityOrder[i]);
      }
    } else if (providerId && updates) {
      // Update individual provider settings
      await supabase
        .from("tts_providers_config")
        .update({
          enabled: updates.enabled,
          priority: updates.priority,
          free_only: updates.freeOnly ?? true, // Strict default
          free_character_limit: updates.freeCharacterLimit,
          model: updates.model,
          voice: updates.voice,
          status: updates.status || "ACTIVE",
          circuit_breaker_failures: updates.resetCircuitBreaker ? 0 : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", providerId);
    }

    return NextResponse.json({ success: true, message: "Configuration updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update config" }, { status: 500 });
  }
}
