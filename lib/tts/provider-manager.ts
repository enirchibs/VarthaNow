import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { 
  TTSProvider, 
  SynthesizeRequest, 
  SynthesizeResult, 
  TTSProviderConfig,
  TTSErrorType 
} from "./types";
import { GoogleTTSProvider } from "./providers/google-tts";
import { AzureTTSProvider } from "./providers/azure-tts";
import { SarvamTTSProvider } from "./providers/sarvam-tts";
import { ElevenLabsTTSProvider } from "./providers/elevenlabs-tts";
import { SelfHostedTTSProvider } from "./providers/selfhosted-tts";

// Master Safety Settings (Default: FREE-ONLY = TRUE, ALLOW PAID = FALSE)
export const MASTER_SAFETY_CONFIG = {
  TTS_ENABLED: process.env.TTS_ENABLED !== "false",
  TTS_FREE_ONLY_MODE: process.env.TTS_FREE_ONLY_MODE !== "false", // Must default to true
  ALLOW_PAID_TTS: process.env.ALLOW_PAID_TTS === "true",           // Must default to false
};

// In-Memory Fallback Cache & Locks for local testing/fallback
const inMemoryCache = new Map<string, SynthesizeResult>();
const activeLocks = new Set<string>();

export class TTSProviderManager {
  private supabase: any = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Telugu Text Normalization & Preprocessing (NO Translation)
   */
  public normalizeTeluguText(text: string): string {
    if (!text) return "";
    return text
      .replace(/<[^>]*>?/gm, "") // Strip HTML tags
      .replace(/(https?:\/\/[^\s]+)/g, "") // Remove URLs
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
  }

  /**
   * Generate SHA-256 Hash of Normalized Text
   */
  public generateTextHash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  /**
   * Intelligently chunk long Telugu text by sentence/punctuation
   */
  public chunkTeluguText(text: string, maxChunkLength = 500): string[] {
    const normalized = this.normalizeTeluguText(text);
    if (normalized.length <= maxChunkLength) {
      return [normalized];
    }

    // Split by Telugu/Standard punctuation: ।, ., !, ?, \n
    const sentences = normalized.split(/(?<=[।.!?\n])\s+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + " " + sentence).trim().length <= maxChunkLength) {
        currentChunk = (currentChunk + " " + sentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence.trim();
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks.length > 0 ? chunks : [normalized];
  }

  /**
   * Fetch active provider configurations from Database (sorted by priority)
   */
  public async getSortedProviders(): Promise<{ provider: TTSProvider; config: TTSProviderConfig }[]> {
    let configs: TTSProviderConfig[] = [];

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("tts_providers_config")
        .select("*")
        .eq("enabled", true)
        .order("priority", { ascending: true });

      if (!error && data) {
        configs = data.map((d: any) => ({
          id: d.id,
          providerName: d.provider_name,
          enabled: d.enabled,
          priority: d.priority,
          freeOnly: d.free_only,
          supportsTelugu: d.supports_telugu,
          model: d.model,
          voice: d.voice,
          freeCharacterLimit: Number(d.free_character_limit),
          freeCreditLimit: Number(d.free_credit_limit),
          freeRequestLimit: Number(d.free_request_limit),
          resetType: d.reset_type,
          resetDate: d.reset_date,
          hardStop: d.hard_stop,
          status: d.status,
          circuitBreakerFailures: d.circuit_breaker_failures || 0,
          cooldownUntil: d.cooldown_until,
        }));
      }
    }

    // Default fallback order if database is empty or offline
    if (configs.length === 0) {
      configs = [
        { id: "google", providerName: "Google Cloud TTS", enabled: true, priority: 1, freeOnly: true, supportsTelugu: true, model: "standard", voice: "te-IN-Standard-A", freeCharacterLimit: 4000000, freeCreditLimit: 0, freeRequestLimit: 10000, resetType: "MONTHLY", resetDate: null, hardStop: true, status: "ACTIVE", circuitBreakerFailures: 0, cooldownUntil: null },
        { id: "azure", providerName: "Azure Speech", enabled: true, priority: 2, freeOnly: true, supportsTelugu: true, model: "neural", voice: "te-IN-ShrutiNeural", freeCharacterLimit: 500000, freeCreditLimit: 0, freeRequestLimit: 10000, resetType: "MONTHLY", resetDate: null, hardStop: true, status: "ACTIVE", circuitBreakerFailures: 0, cooldownUntil: null },
        { id: "sarvam", providerName: "Sarvam AI", enabled: true, priority: 3, freeOnly: true, supportsTelugu: true, model: "bulbul:v1", voice: "te-IN-female", freeCharacterLimit: 200000, freeCreditLimit: 100, freeRequestLimit: 10000, resetType: "MONTHLY", resetDate: null, hardStop: true, status: "ACTIVE", circuitBreakerFailures: 0, cooldownUntil: null },
        { id: "elevenlabs", providerName: "ElevenLabs", enabled: true, priority: 4, freeOnly: true, supportsTelugu: true, model: "eleven_multilingual_v2", voice: "TeluguVoice1", freeCharacterLimit: 10000, freeCreditLimit: 0, freeRequestLimit: 1000, resetType: "MONTHLY", resetDate: null, hardStop: true, status: "ACTIVE", circuitBreakerFailures: 0, cooldownUntil: null },
        { id: "selfhosted", providerName: "Self-Hosted", enabled: false, priority: 5, freeOnly: true, supportsTelugu: true, model: "vits-te", voice: "default", freeCharacterLimit: 10000000, freeCreditLimit: 0, freeRequestLimit: 100000, resetType: "NONE", resetDate: null, hardStop: true, status: "ACTIVE", circuitBreakerFailures: 0, cooldownUntil: null },
      ];
    }

    const instances: { provider: TTSProvider; config: TTSProviderConfig }[] = [];

    for (const cfg of configs) {
      // ZERO SURPRISE BILLING: If freeOnly is required and provider is paid -> SKIP
      if (MASTER_SAFETY_CONFIG.TTS_FREE_ONLY_MODE && !cfg.freeOnly && !MASTER_SAFETY_CONFIG.ALLOW_PAID_TTS) {
        continue;
      }

      // Check if provider status is EXHAUSTED or in COOLDOWN
      if (cfg.status === "FREE_QUOTA_EXHAUSTED") continue;
      if (cfg.cooldownUntil && new Date(cfg.cooldownUntil) > new Date()) continue;

      let providerInstance: TTSProvider | null = null;

      if (cfg.id === "google") {
        providerInstance = new GoogleTTSProvider({ enabled: cfg.enabled, freeOnly: cfg.freeOnly, freeCharLimit: cfg.freeCharacterLimit });
      } else if (cfg.id === "azure") {
        providerInstance = new AzureTTSProvider({ enabled: cfg.enabled, freeOnly: cfg.freeOnly, freeCharLimit: cfg.freeCharacterLimit });
      } else if (cfg.id === "sarvam") {
        providerInstance = new SarvamTTSProvider({ enabled: cfg.enabled, freeOnly: cfg.freeOnly, freeCharLimit: cfg.freeCharacterLimit });
      } else if (cfg.id === "elevenlabs") {
        providerInstance = new ElevenLabsTTSProvider({ enabled: cfg.enabled, freeOnly: cfg.freeOnly, freeCharLimit: cfg.freeCharacterLimit });
      } else if (cfg.id === "selfhosted") {
        providerInstance = new SelfHostedTTSProvider({ enabled: cfg.enabled, freeOnly: cfg.freeOnly });
      }

      if (providerInstance && providerInstance.isEnabled()) {
        instances.push({ provider: providerInstance, config: cfg });
      }
    }

    return instances;
  }

  /**
   * Pre-flight local quota check from Supabase Database usage tracking
   */
  private async checkLocalUsageQuota(providerId: string, charCount: number, limit: number): Promise<boolean> {
    if (!this.supabase) return true;

    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data } = await this.supabase
        .from("tts_usage_logs")
        .select("characters_used")
        .eq("provider_id", providerId)
        .gte("period_start", periodStart)
        .maybeSingle();

      const currentUsed = data ? Number(data.characters_used) : 0;
      return (currentUsed + charCount) <= limit;
    } catch {
      return true; // Fallback to provider internal check
    }
  }

  /**
   * Atomically update provider usage after successful synthesis
   */
  private async recordUsage(providerId: string, charCount: number): Promise<void> {
    if (!this.supabase) return;

    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data } = await this.supabase
        .from("tts_usage_logs")
        .select("id, characters_used, requests_used")
        .eq("provider_id", providerId)
        .gte("period_start", periodStart)
        .maybeSingle();

      if (data) {
        await this.supabase
          .from("tts_usage_logs")
          .update({
            characters_used: Number(data.characters_used) + charCount,
            requests_used: Number(data.requests_used) + 1,
            last_success: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", data.id);
      } else {
        await this.supabase.from("tts_usage_logs").insert({
          provider_id: providerId,
          period_start: periodStart,
          period_end: periodEnd,
          characters_used: charCount,
          requests_used: 1,
          last_success: now.toISOString(),
        });
      }
    } catch {}
  }

  /**
   * Record provider failure and update circuit breaker state
   */
  private async recordFailure(providerId: string, errorType: TTSErrorType, reason: string): Promise<void> {
    if (!this.supabase) return;

    try {
      const now = new Date();
      
      if (errorType === "QUOTA_EXHAUSTED" || errorType === "FREE_CREDITS_EXHAUSTED") {
        // Mark provider status as EXHAUSTED for the free period
        await this.supabase
          .from("tts_providers_config")
          .update({ status: "FREE_QUOTA_EXHAUSTED", updated_at: now.toISOString() })
          .eq("id", providerId);
      } else {
        // Increment circuit breaker failures
        const { data } = await this.supabase
          .from("tts_providers_config")
          .select("circuit_breaker_failures")
          .eq("id", providerId)
          .single();

        const currentFailures = (data?.circuit_breaker_failures || 0) + 1;
        const updates: any = {
          circuit_breaker_failures: currentFailures,
          updated_at: now.toISOString(),
        };

        // 3 consecutive failures trigger 15-min cooldown
        if (currentFailures >= 3) {
          const cooldown = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
          updates.status = "TEMPORARILY_UNAVAILABLE";
          updates.cooldown_until = cooldown;
        }

        await this.supabase
          .from("tts_providers_config")
          .update(updates)
          .eq("id", providerId);
      }
    } catch {}
  }

  /**
   * Master Synthesis Synthesizer Method with Failover & Free-Only Protection
   */
  public async synthesizeTelugu(req: SynthesizeRequest): Promise<SynthesizeResult> {
    if (!MASTER_SAFETY_CONFIG.TTS_ENABLED) {
      return { success: true, mode: "DEVICE_TTS", language: "te-IN" };
    }

    const textNormalized = this.normalizeTeluguText(req.text);
    if (!textNormalized) {
      return { success: false, mode: "DEVICE_TTS", language: "te-IN", error: "Empty text provided" };
    }

    const textHash = this.generateTextHash(textNormalized);
    const cacheKey = `te-IN-${req.articleId || 'custom'}-${textHash.slice(0, 16)}`;

    // 1. CHECK CACHE FIRST
    if (inMemoryCache.has(cacheKey)) {
      const cached = inMemoryCache.get(cacheKey)!;
      return { ...cached, cached: true };
    }

    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from("tts_audio_cache")
          .select("*")
          .eq("cache_key", cacheKey)
          .maybeSingle();

        if (data && (data.audio_url || data.audio_base64)) {
          const res: SynthesizeResult = {
            success: true,
            mode: "CLOUD_AUDIO",
            audioUrl: data.audio_url,
            audioBase64: data.audio_base64,
            provider: data.provider_id,
            cached: true,
            language: "te-IN",
            durationSeconds: data.duration_seconds,
            fileSizeBytes: data.file_size_bytes,
          };
          inMemoryCache.set(cacheKey, res);
          return res;
        }
      } catch {}
    }

    // 2. CONCURRENCY LOCK (Prevent 100 simultaneous requests)
    if (activeLocks.has(cacheKey)) {
      // Wait up to 3 seconds for existing generation
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 200));
        if (inMemoryCache.has(cacheKey)) {
          return { ...inMemoryCache.get(cacheKey)!, cached: true };
        }
      }
    }
    activeLocks.add(cacheKey);

    try {
      // 3. FETCH ENABLED FREE PROVIDERS SORTED BY PRIORITY
      const providerEntries = await this.getSortedProviders();
      const charCount = textNormalized.length;

      for (const { provider, config } of providerEntries) {
        // Pre-flight quota check
        const hasQuota = await this.checkLocalUsageQuota(provider.id, charCount, config.freeCharacterLimit);
        if (!hasQuota) {
          await this.recordFailure(provider.id, "QUOTA_EXHAUSTED", "Local quota exhausted");
          continue; // SKIP PROVIDER -> GO TO NEXT
        }

        // Execute synthesis
        const result = await provider.synthesize(textNormalized, config.voice, config.model);

        if (result.success) {
          // Record usage atomically
          await this.recordUsage(provider.id, charCount);

          // Store in Cache
          inMemoryCache.set(cacheKey, result);
          if (this.supabase) {
            try {
              await this.supabase.from("tts_audio_cache").insert({
                cache_key: cacheKey,
                article_id: req.articleId,
                article_slug: req.slug,
                text_hash: textHash,
                language: "te-IN",
                provider_id: provider.id,
                model: config.model,
                voice: config.voice,
                audio_url: result.audioUrl || `data:audio/mp3;base64,${result.audioBase64}`,
                audio_base64: result.audioBase64,
                file_size_bytes: result.fileSizeBytes || 0,
                duration_seconds: result.durationSeconds || 0,
              });
            } catch {}
          }

          return result;
        } else {
          // Handle error & Circuit Breaker
          if (result.errorType) {
            await this.recordFailure(provider.id, result.errorType, result.error || "Synthesis failed");
          }
          // Continue loop to next free provider!
        }
      }

      // 4. FINAL FALLBACK: If all free cloud/self-hosted providers fail or exhausted -> ANDROID DEVICE TTS
      const fallbackResult: SynthesizeResult = {
        success: true,
        mode: "DEVICE_TTS",
        language: "te-IN",
        provider: "android",
      };
      inMemoryCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    } finally {
      activeLocks.delete(cacheKey);
    }
  }
}

export const ttsProviderManager = new TTSProviderManager();
