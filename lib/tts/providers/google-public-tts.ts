import { TTSProvider, SynthesizeResult } from "../types";

/**
 * Free Google Translate Public TTS Provider
 * Requires ZERO API Keys. Works out of the box for Telugu ("te").
 */
export class GooglePublicTTSProvider implements TTSProvider {
  public id = "google-public";
  public name = "Google Translate Public TTS (Free)";

  public supportsTelugu(): boolean {
    return true;
  }

  public isEnabled(): boolean {
    return true; // Always enabled as zero-config free fallback
  }

  public isFreeOnly(): boolean {
    return true;
  }

  public async hasEnoughFreeQuota(): Promise<boolean> {
    return true;
  }

  public estimateUsage(text: string): { characterCount: number; estimatedCredits: number } {
    return { characterCount: text.length, estimatedCredits: 0 };
  }

  /**
   * Split text into <=200 character chunks for Google Translate Public TTS
   */
  private chunkText(text: string, maxLen = 180): string[] {
    const clean = text
      .replace(/<[^>]*>?/gm, "")
      .replace(/(https?:\/\/[^\s]+)/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (clean.length <= maxLen) return [clean];

    const sentences = clean.split(/(?<=[।.!?\n])\s+/);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + " " + sentence).trim().length <= maxLen) {
        current = (current + " " + sentence).trim();
      } else {
        if (current) chunks.push(current);
        // If single sentence > maxLen, hard chunk by word boundary
        if (sentence.length > maxLen) {
          const words = sentence.split(" ");
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).trim().length <= maxLen) {
              sub = (sub + " " + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) chunks.push(sub);
        } else {
          current = sentence.trim();
        }
      }
    }
    if (current) chunks.push(current);

    return chunks.length > 0 ? chunks : [clean];
  }

  public async synthesize(text: string): Promise<SynthesizeResult> {
    try {
      const chunks = this.chunkText(text, 180);
      if (chunks.length === 0) {
        return { success: false, mode: "DEVICE_TTS", language: "te-IN", error: "Empty text" };
      }

      // Fetch audio chunks from Google Public TTS
      const audioBuffers: Buffer[] = [];

      for (const chunk of chunks) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=te&client=tw-ob`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (!res.ok) {
          throw new Error(`Google Public TTS failed with status ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuffer));
      }

      // Concatenate MP3 buffers
      const combinedBuffer = Buffer.concat(audioBuffers);
      const audioBase64 = combinedBuffer.toString("base64");

      return {
        success: true,
        mode: "CLOUD_AUDIO",
        provider: "google-public",
        language: "te-IN",
        audioBase64,
        fileSizeBytes: combinedBuffer.length,
        durationSeconds: Math.ceil(text.length / 15),
      };
    } catch (err: any) {
      return {
        success: false,
        mode: "DEVICE_TTS",
        language: "te-IN",
        error: err?.message || "Failed to synthesize via Google Public TTS",
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    return true;
  }
}
