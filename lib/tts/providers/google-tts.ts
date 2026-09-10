import { TTSProvider, SynthesizeResult, TTSErrorType } from "../types";

export class GoogleTTSProvider implements TTSProvider {
  public id = "google";
  public name = "Google Cloud Text-to-Speech";

  private enabled: boolean;
  private freeOnly: boolean;
  private freeCharLimit: number;
  private currentUsage: number;

  constructor(config?: { enabled?: boolean; freeOnly?: boolean; freeCharLimit?: number; currentUsage?: number }) {
    this.enabled = config?.enabled ?? true;
    this.freeOnly = config?.freeOnly ?? true;
    this.freeCharLimit = config?.freeCharLimit ?? 4000000; // 4,000,000 free chars/month for Standard voices
    this.currentUsage = config?.currentUsage ?? 0;
  }

  public supportsTelugu(): boolean {
    return true;
  }

  public isEnabled(): boolean {
    return this.enabled && (process.env.GOOGLE_TTS_API_KEY != null || process.env.GOOGLE_TTS_CREDENTIALS != null);
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
    return { characterCount, estimatedCredits: 0 };
  }

  public async synthesize(text: string, voice = "te-IN-Standard-A", model = "standard"): Promise<SynthesizeResult> {
    const { characterCount } = this.estimateUsage(text);

    // Hard local free check
    if (!await this.hasEnoughFreeQuota(characterCount)) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Google Cloud TTS local free quota limit reached",
        errorType: "QUOTA_EXHAUSTED",
      };
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey && !process.env.GOOGLE_TTS_CREDENTIALS) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Google Cloud TTS credentials missing",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    try {
      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey || ""}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "te-IN",
            name: voice,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0.0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        
        let errorType: TTSErrorType = "SERVER_ERROR";
        if (status === 429 || status === 403 || errorData?.error?.message?.includes("quota")) {
          errorType = "QUOTA_EXHAUSTED";
        } else if (status === 401) {
          errorType = "AUTHENTICATION_ERROR";
        }

        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: errorData?.error?.message || `Google TTS error HTTP ${status}`,
          errorType,
        };
      }

      const data = await response.json();
      const audioBase64 = data.audioContent;

      if (!audioBase64) {
        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: "Empty audio content returned by Google TTS",
          errorType: "SERVER_ERROR",
        };
      }

      const audioBuffer = Buffer.from(audioBase64, "base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "google",
        language: "te-IN",
        audioBase64,
        fileSizeBytes: audioBuffer.length,
        durationSeconds: Math.ceil(characterCount / 15), // Approximate reading speed
      };
    } catch (err: any) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: err?.message || "Network error calling Google TTS",
        errorType: "NETWORK_ERROR",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isEnabled();
  }
}
