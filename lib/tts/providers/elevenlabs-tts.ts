import { TTSProvider, SynthesizeResult, TTSErrorType } from "../types";

export class ElevenLabsTTSProvider implements TTSProvider {
  public id = "elevenlabs";
  public name = "ElevenLabs Telugu (Free Plan Only)";

  private enabled: boolean;
  private freeOnly: boolean;
  private freeCharLimit: number;
  private currentUsage: number;

  constructor(config?: { enabled?: boolean; freeOnly?: boolean; freeCharLimit?: number; currentUsage?: number }) {
    this.enabled = config?.enabled ?? true;
    this.freeOnly = config?.freeOnly ?? true;
    this.freeCharLimit = config?.freeCharLimit ?? 10000; // 10,000 free chars/month on ElevenLabs Free tier
    this.currentUsage = config?.currentUsage ?? 0;
  }

  public supportsTelugu(): boolean {
    return true; // Supported via eleven_multilingual_v2
  }

  public isEnabled(): boolean {
    return this.enabled && process.env.ELEVENLABS_API_KEY != null;
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
    return { characterCount, estimatedCredits: characterCount };
  }

  public async synthesize(text: string, voice = "21m00Tcm4TlvDq8ikWAM", model = "eleven_multilingual_v2"): Promise<SynthesizeResult> {
    const { characterCount } = this.estimateUsage(text);

    // Verify Telugu support & Free quota
    if (!this.supportsTelugu() || !await this.hasEnoughFreeQuota(characterCount)) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "ElevenLabs free quota limit reached or unsupported model",
        errorType: "FREE_CREDITS_EXHAUSTED",
      };
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "ElevenLabs API Key missing",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    try {
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
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
          error: `ElevenLabs HTTP ${status}`,
          errorType,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const audioBase64 = audioBuffer.toString("base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "elevenlabs",
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
        error: err?.message || "Network error calling ElevenLabs",
        errorType: "NETWORK_ERROR",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isEnabled();
  }
}
