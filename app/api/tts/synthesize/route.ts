import { NextRequest, NextResponse } from "next/server";
import { ttsProviderManager } from "@/lib/tts/provider-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, slug, text, language } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Valid Telugu text is required", mode: "DEVICE_TTS", language: "te-IN" },
        { status: 400 }
      );
    }

    const result = await ttsProviderManager.synthesizeTelugu({
      articleId: articleId || `custom-${Date.now()}`,
      slug,
      text,
      language: language || "te-IN",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    // Zero crash guarantee -> return DEVICE_TTS fallback
    return NextResponse.json({
      success: true,
      mode: "DEVICE_TTS",
      language: "te-IN",
      provider: "android",
      error: err?.message || "Internal synthesis server error",
    });
  }
}
