import { TTSProvider, SynthesizeResult, TTSErrorType } from "../types";

export class SarvamTTSProvider implements TTSProvider {
  public id = "sarvam";
  public name = "Sarvam AI Telugu (Bulbul)";

  private enabled: boolean;
  private freeOnly: boolean;
  private freeCharLimit: number;
  private currentUsage: number;

  constructor(config?: { enabled?: boolean; freeOnly?: boolean; freeCharLimit?: number; currentUsage?: number }) {
    this.enabled = config?.enabled ?? true;
    this.freeOnly = config?.freeOnly ?? true;
    this.freeCharLimit = config?.freeCharLimit ?? 200000; // 200,000 free chars/month
    this.currentUsage = config?.currentUsage ?? 0;
  }

  public supportsTelugu(): boolean {
    return true;
  }

  public isEnabled(): boolean {
    return this.enabled && process.env.SARVAM_API_KEY != null;
  }

  public isFreeOnly(): boolean {
    return this.freeOnly;
  }

  public async hasEnoughFreeQuota(characterCount: number): Promise<boolean> {
    if (!this.freeOnly) return false;
    return (this.currentUsage + characterCount) <= this.freeCharLimit;
  }

  public estimateUsage(text: string): { characterCount: number; estimatedCredits: number } {
    const characterCount = Array.from(text).length;
    return { characterCount, estimatedCredits: Math.ceil(characterCount / 1000) };
  }

  public async synthesize(text: string, voice = "te-IN-female", model = "bulbul:v1"): Promise<SynthesizeResult> {
    const { characterCount } = this.estimateUsage(text);

    if (!await this.hasEnoughFreeQuota(characterCount)) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Sarvam AI local free credits limit reached",
        errorType: "FREE_CREDITS_EXHAUSTED",
      };
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Sarvam API Key missing",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    try {
      const endpoint = "https://api.sarvam.ai/text-to-speech";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "api-subscription-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: "te-IN",
          speaker: voice || "meera",
          model: model || "bulbul:v1",
        }),
      });

      if (!response.ok) {
        const status = response.status;
        let errorType: TTSErrorType = "SERVER_ERROR";
        if (status === 429 || status === 402) {
          errorType = "FREE_CREDITS_EXHAUSTED";
        } else if (status === 401) {
          errorType = "AUTHENTICATION_ERROR";
        }

        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: `Sarvam AI HTTP ${status}`,
          errorType,
        };
      }

      const data = await response.json();
      const audioBase64 = data.audios?.[0] || data.audio;

      if (!audioBase64) {
        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: "Empty audio returned by Sarvam AI",
          errorType: "SERVER_ERROR",
        };
      }

      const audioBuffer = Buffer.from(audioBase64, "base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "sarvam",
        language: "te-IN",
        audioBase64,
        fileSizeBytes: audioBuffer.length,
        durationSeconds: Math.ceil(characterCount / 15),
      };
    } catch (err: any) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: err?.message || "Network error calling Sarvam AI",
        errorType: "NETWORK_ERROR",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isEnabled();
  }
}
