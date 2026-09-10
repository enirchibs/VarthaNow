import { TTSProvider, SynthesizeResult, TTSErrorType } from "../types";

export class AzureTTSProvider implements TTSProvider {
  public id = "azure";
  public name = "Microsoft Azure Speech (F0 Free Tier)";

  private enabled: boolean;
  private freeOnly: boolean;
  private freeCharLimit: number;
  private currentUsage: number;

  constructor(config?: { enabled?: boolean; freeOnly?: boolean; freeCharLimit?: number; currentUsage?: number }) {
    this.enabled = config?.enabled ?? true;
    this.freeOnly = config?.freeOnly ?? true;
    this.freeCharLimit = config?.freeCharLimit ?? 500000; // 500,000 free chars/month F0 tier
    this.currentUsage = config?.currentUsage ?? 0;
  }

  public supportsTelugu(): boolean {
    return true;
  }

  public isEnabled(): boolean {
    return this.enabled && (process.env.AZURE_SPEECH_KEY != null && process.env.AZURE_SPEECH_REGION != null);
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

  public async synthesize(text: string, voice = "te-IN-ShrutiNeural", model = "neural"): Promise<SynthesizeResult> {
    const { characterCount } = this.estimateUsage(text);

    if (!await this.hasEnoughFreeQuota(characterCount)) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Azure Speech local free F0 quota limit reached",
        errorType: "QUOTA_EXHAUSTED",
      };
    }

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: "Azure Speech credentials missing",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    try {
      const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
      const ssml = `
        <speak version='1.0' xml:lang='te-IN'>
          <voice xml:lang='te-IN' name='${voice}'>
            ${text}
          </voice>
        </speak>
      `.trim();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
          "User-Agent": "VarthaNowTeluguTTS",
        },
        body: ssml,
      });

      if (!response.ok) {
        const status = response.status;
        let errorType: TTSErrorType = "SERVER_ERROR";
        if (status === 429 || status === 403) {
          errorType = "QUOTA_EXHAUSTED";
        } else if (status === 401) {
          errorType = "AUTHENTICATION_ERROR";
        }

        return {
          success: false,
          mode: "DEVICE_TTS",
          language: "te-IN",
          error: `Azure Speech HTTP ${status}`,
          errorType,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const audioBase64 = audioBuffer.toString("base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "azure",
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
        error: err?.message || "Network error calling Azure Speech",
        errorType: "NETWORK_ERROR",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isEnabled();
  }
}
