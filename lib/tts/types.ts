// Core Types & Interfaces for Free-Only Telugu TTS Engine

export type TTSErrorType =
  | "QUOTA_EXHAUSTED"
  | "FREE_CREDITS_EXHAUSTED"
  | "RATE_LIMITED"
  | "AUTHENTICATION_ERROR"
  | "INVALID_REQUEST"
  | "UNSUPPORTED_LANGUAGE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "PROVIDER_UNAVAILABLE"
  | "UNKNOWN";

export type TTSProviderStatus =
  | "ACTIVE"
  | "FREE_QUOTA_EXHAUSTED"
  | "TEMPORARILY_UNAVAILABLE"
  | "DISABLED";

export type TTSResponseMode = "CLOUD_AUDIO" | "DEVICE_TTS";

export interface TTSProviderConfig {
  id: string;
  providerName: string;
  enabled: boolean;
  priority: number;
  freeOnly: boolean;
  supportsTelugu: boolean;
  model: string;
  voice: string;
  freeCharacterLimit: number;
  freeCreditLimit: number;
  freeRequestLimit: number;
  resetType: "MONTHLY" | "DAILY" | "NONE";
  resetDate: string | null;
  hardStop: boolean;
  status: TTSProviderStatus;
  circuitBreakerFailures: number;
  cooldownUntil: string | null;
}

export interface TTSUsageLog {
  providerId: string;
  periodStart: string;
  periodEnd: string;
  charactersUsed: number;
  requestsUsed: number;
  creditsUsed: number;
  configuredFreeLimit: number;
  remainingFreeLimit: number;
  lastSuccess?: string | null;
  lastFailure?: string | null;
  failureReason?: string | null;
}

export interface SynthesizeRequest {
  articleId: string;
  slug?: string;
  text: string;
  language?: string; // Default: 'te-IN'
}

export interface SynthesizeResult {
  success: boolean;
  mode: TTSResponseMode;
  audioUrl?: string;
  audioBase64?: string;
  provider?: string;
  cached?: boolean;
  language: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  error?: string;
  errorType?: TTSErrorType;
}

export interface TTSProvider {
  id: string;
  name: string;
  supportsTelugu(): boolean;
  isEnabled(): boolean;
  isFreeOnly(): boolean;
  hasEnoughFreeQuota(characterCount: number): Promise<boolean>;
  estimateUsage(text: string): { characterCount: number; estimatedCredits: number };
  synthesize(text: string, voice?: string, model?: string): Promise<SynthesizeResult>;
  healthCheck(): Promise<boolean>;
}

export interface TTSAudioCacheItem {
  id: string;
  cacheKey: string;
  articleId?: string;
  articleSlug?: string;
  textHash: string;
  language: string;
  providerId: string;
  model: string;
  voice: string;
  audioUrl: string;
  audioBase64?: string;
  fileSizeBytes: number;
  durationSeconds: number;
  createdAt: string;
}

export interface MasterSafetyConfig {
  ttsEnabled: boolean;
  ttsFreeOnlyMode: boolean; // MUST default to TRUE
  allowPaidTTS: boolean;    // MUST default to FALSE
}
