-- ============================================================================
-- VaartaNow Article Engagement System Migration
-- Migration Date: 2026-08-20
-- ============================================================================

-- 1. Article Polls Table
CREATE TABLE IF NOT EXISTS public.article_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  engagement_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Article Poll Votes Table
CREATE TABLE IF NOT EXISTS public.article_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.article_polls(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, session_id)
);

-- 3. Article Reader Opinions Table
CREATE TABLE IF NOT EXISTS public.article_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  display_name TEXT DEFAULT 'పాఠకుడు',
  locality TEXT,
  selected_option_id TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS article_polls_article_idx ON public.article_polls (article_id);
CREATE INDEX IF NOT EXISTS article_poll_votes_lookup_idx ON public.article_poll_votes (article_id, session_id);
CREATE INDEX IF NOT EXISTS article_opinions_article_idx ON public.article_opinions (article_id, created_at DESC);

-- Grants for Supabase compliance
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_polls TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_poll_votes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_opinions TO anon, authenticated, service_role;
