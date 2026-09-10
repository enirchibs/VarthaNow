import { TTSProvider, SynthesizeResult, TTSErrorType } from "../types";

export class SelfHostedTTSProvider implements TTSProvider {
  public id = "selfhosted";
  public name = "Self-Hosted Open-Source Telugu TTS";

  private enabled: boolean;
  private freeOnly: boolean;

  constructor(config?: { enabled?: boolean; freeOnly?: boolean }) {
    this.enabled = config?.enabled ?? false;
    this.freeOnly = config?.freeOnly ?? true;
  }

  public supportsTelugu(): boolean {
    return true;
  }

  public isEnabled(): boolean {
    return this.enabled && process.env.SELF_HOSTED_TTS_URL != null;
  }

  public isFreeOnly(): boolean {
    return true; // Self-hosted has 0 external API billing
  }

  public async hasEnoughFreeQuota(): Promise<boolean> {
    return true; // Self-hosted open-source has unlimited usage
  }

  public estimateUsage(text: string): { characterCount: number; estimatedCredits: number } {
    const characterCount = Array.from(text).length;
    return { characterCount, estimatedCredits: 0 };
  }

  public async synthesize(text: string, voice = "vits-te", model = "default"): Promise<SynthesizeResult> {
    const url = process.env.SELF_HOSTED_TTS_URL;
    if (!url) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Self-Hosted TTS URL not configured",
        errorType: "PROVIDER_UNAVAILABLE",
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "te", voice, model }),
      });

      if (!response.ok) {
        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: `Self-Hosted TTS HTTP ${response.status}`,
          errorType: "SERVER_ERROR",
        };
      }

      const contentType = response.headers.get("content-type") || "";
      let audioBase64 = "";

      if (contentType.includes("application/json")) {
        const json = await response.json();
        audioBase64 = json.audio_base64 || json.audio;
      } else {
        const arrayBuffer = await response.arrayBuffer();
        audioBase64 = Buffer.from(arrayBuffer).toString("base64");
      }

      const audioBuffer = Buffer.from(audioBase64, "base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "selfhosted",
        language: "te-IN",
        audioBase64,
        fileSizeBytes: audioBuffer.length,
        durationSeconds: Math.ceil(text.length / 15),
      };
    } catch (err: any) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: err?.message || "Self-Hosted TTS connection error",
        errorType: "NETWORK_ERROR",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isEnabled();
  }
}
