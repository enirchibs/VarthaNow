-- Migration: Create Telugu TTS Engine Tables with Free-Only Enforcement & Quota Tracking

-- 1. TTS Provider Configuration Table
CREATE TABLE IF NOT EXISTS public.tts_providers_config (
  id VARCHAR(50) PRIMARY KEY,
  provider_name VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 1,
  free_only BOOLEAN NOT NULL DEFAULT true,
  supports_telugu BOOLEAN NOT NULL DEFAULT true,
  model VARCHAR(100) NOT NULL DEFAULT 'default',
  voice VARCHAR(100) NOT NULL DEFAULT 'te-IN-Standard-A',
  free_character_limit BIGINT NOT NULL DEFAULT 1000000,
  free_credit_limit BIGINT NOT NULL DEFAULT 1000,
  free_request_limit BIGINT NOT NULL DEFAULT 10000,
  reset_type VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
  reset_date TIMESTAMPTZ,
  hard_stop BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, FREE_QUOTA_EXHAUSTED, TEMPORARILY_UNAVAILABLE, DISABLED
  circuit_breaker_failures INT NOT NULL DEFAULT 0,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TTS Usage Tracking Table
CREATE TABLE IF NOT EXISTS public.tts_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(50) NOT NULL REFERENCES public.tts_providers_config(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  characters_used BIGINT NOT NULL DEFAULT 0,
  requests_used BIGINT NOT NULL DEFAULT 0,
  credits_used BIGINT NOT NULL DEFAULT 0,
  configured_free_limit BIGINT NOT NULL DEFAULT 1000000,
  remaining_free_limit BIGINT NOT NULL DEFAULT 1000000,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by provider and active period
CREATE INDEX IF NOT EXISTS idx_tts_usage_provider_period 
ON public.tts_usage_logs(provider_id, period_start, period_end);

-- 3. Audio Cache Table (SHA-256 Hashed Audio Cache)
CREATE TABLE IF NOT EXISTS public.tts_audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(128) UNIQUE NOT NULL,
  article_id VARCHAR(255),
  article_slug VARCHAR(255),
  text_hash VARCHAR(64) NOT NULL,
  language VARCHAR(20) NOT NULL DEFAULT 'te-IN',
  provider_id VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  voice VARCHAR(100) NOT NULL,
  audio_url TEXT NOT NULL,
  audio_base64 TEXT,
  file_size_bytes INT NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tts_cache_key ON public.tts_audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_tts_cache_article ON public.tts_audio_cache(article_id, text_hash);

-- 4. Concurrency & Idempotency Generation Lock Table
CREATE TABLE IF NOT EXISTS public.tts_generation_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id VARCHAR(255) NOT NULL,
  text_hash VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, GENERATING, READY, FAILED
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_article_text_lock UNIQUE(article_id, text_hash)
);

-- Seed Default Provider Configurations with Conservative Free Allowances
INSERT INTO public.tts_providers_config 
(id, provider_name, enabled, priority, free_only, supports_telugu, model, voice, free_character_limit, free_credit_limit, reset_type, hard_stop, status)
VALUES
('google', 'Google Cloud Text-to-Speech', true, 1, true, true, 'standard', 'te-IN-Standard-A', 4000000, 0, 'MONTHLY', true, 'ACTIVE'),
('azure', 'Microsoft Azure Speech', true, 2, true, true, 'neural', 'te-IN-ShrutiNeural', 500000, 0, 'MONTHLY', true, 'ACTIVE'),
('sarvam', 'Sarvam AI Telugu', true, 3, true, true, 'bulbul:v1', 'te-IN-female', 200000, 100, 'MONTHLY', true, 'ACTIVE'),
('elevenlabs', 'ElevenLabs Telugu', true, 4, true, true, 'eleven_multilingual_v2', 'TeluguVoice1', 10000, 0, 'MONTHLY', true, 'ACTIVE'),
('selfhosted', 'Self-Hosted Telugu TTS', false, 5, true, true, 'vits-te', 'default', 10000000, 0, 'NONE', true, 'ACTIVE'),
('android', 'Android Built-in Native TTS', true, 999, true, true, 'native', 'te-IN', 999999999, 0, 'NONE', false, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  priority = EXCLUDED.priority,
  free_only = EXCLUDED.free_only,
  supports_telugu = EXCLUDED.supports_telugu;
