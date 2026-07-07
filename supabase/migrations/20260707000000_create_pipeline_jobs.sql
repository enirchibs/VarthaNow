-- ============================================================================
-- Migration: Production Job Queue System
-- Replaces social_thumbnail_url state machine with proper pipeline_jobs table
-- ============================================================================

-- Enable pg_trgm for title similarity deduplication
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── pipeline_jobs: Core async job queue ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug     text NOT NULL REFERENCES public.blog_posts(slug) ON DELETE CASCADE,
  job_type      text NOT NULL CHECK (job_type IN (
                  'rewrite', 'seo', 'tags', 'summary',
                  'social', 'quality', 'sitemap', 'notify'
                )),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN (
                  'pending', 'processing', 'done', 'failed', 'dead', 'skipped'
                )),
  priority      int  NOT NULL DEFAULT 50,   -- 0 = highest, 100 = lowest
  retry_count   int  NOT NULL DEFAULT 0,
  max_retries   int  NOT NULL DEFAULT 3,
  scheduled_at  timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz,
  completed_at  timestamptz,
  error_log     text,
  payload       jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient worker polling
CREATE INDEX IF NOT EXISTS pipeline_jobs_pending_idx
  ON public.pipeline_jobs (job_type, priority ASC, scheduled_at ASC)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS pipeline_jobs_post_slug_idx
  ON public.pipeline_jobs (post_slug);

CREATE INDEX IF NOT EXISTS pipeline_jobs_status_idx
  ON public.pipeline_jobs (status, completed_at DESC);

-- RLS
ALTER TABLE public.pipeline_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to pipeline_jobs"
  ON public.pipeline_jobs FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_jobs TO service_role;
GRANT SELECT ON public.pipeline_jobs TO anon;

-- ─── pipeline_failures: Dead Letter Archive ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_failures (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug    text,
  job_type     text,
  error        text,
  payload      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to pipeline_failures"
  ON public.pipeline_failures FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT ON public.pipeline_failures TO service_role;

-- ─── Title similarity dedup index ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS blog_posts_title_trgm_idx
  ON public.blog_posts USING gin (title gin_trgm_ops);

-- ─── Expand category constraint ─────────────────────────────────────────────
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_category_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_category_check CHECK (
    category IN (
      'andhra-pradesh', 'telangana', 'cinema', 'vizag',
      'technology', 'jobs', 'cricket', 'politics',
      'national', 'international', 'business', 'sports',
      'entertainment', 'health', 'devotional',
      'breaking', 'crime', 'weather', 'election',
      'education', 'lifestyle', 'science', 'environment',
      'astrology', 'agriculture', 'automobile', 'real-estate',
      'travel', 'food', 'spiritual'
    )
  );

-- ─── Add source_url column for direct-feed tracking ─────────────────────────
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS publisher text,
  ADD COLUMN IF NOT EXISTS ai_queue_status text DEFAULT 'pending_ai',
  ADD COLUMN IF NOT EXISTS extraction_quality_score integer,
  ADD COLUMN IF NOT EXISTS word_count integer,
  ADD COLUMN IF NOT EXISTS telegram_posted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sitemap_pinged boolean DEFAULT false;

-- Create index for the ai_queue_status for backward compatibility queries
CREATE INDEX IF NOT EXISTS blog_posts_ai_queue_idx
  ON public.blog_posts (ai_queue_status, relevance_score DESC)
  WHERE ai_queue_status IN ('pending_ai', 'batch_ai');

-- ─── Similarity function for dedup RPC ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.find_similar_title(
  q_title text,
  threshold float DEFAULT 0.7
)
RETURNS TABLE(slug text, title text, similarity float) AS $$
  SELECT
    bp.slug,
    bp.title,
    similarity(bp.title, q_title) AS similarity
  FROM public.blog_posts bp
  WHERE
    similarity(bp.title, q_title) > threshold
    AND bp.published_at > now() - interval '24 hours'
  ORDER BY similarity DESC
  LIMIT 5;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.find_similar_title TO service_role, anon;
