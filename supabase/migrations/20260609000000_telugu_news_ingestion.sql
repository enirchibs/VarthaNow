-- Migration: Consolidated News Image Validation & Telugu News Ingestion Pipeline
-- Adds columns for metadata, validation, storage path, tags, source tracking, and content hash.
-- Expands category CHECK constraints and creates GIN indexes.

-- 1. Add Phase 2 Image Validation & Metadata columns
ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS source_image_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS featured_image_url text,
  ADD COLUMN IF NOT EXISTS social_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS summary_short text,
  ADD COLUMN IF NOT EXISTS summary_medium text,
  ADD COLUMN IF NOT EXISTS summary_long text,
  ADD COLUMN IF NOT EXISTS image_validation_status text DEFAULT 'review',
  ADD COLUMN IF NOT EXISTS image_validation_reason text,
  ADD COLUMN IF NOT EXISTS relevance_score integer,
  ADD COLUMN IF NOT EXISTS quality_score integer,
  ADD COLUMN IF NOT EXISTS safety_score integer,
  ADD COLUMN IF NOT EXISTS clickbait_score integer,
  ADD COLUMN IF NOT EXISTS validated_at timestamptz;

-- 2. Add Phase 3 Telugu News Ingestion columns
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS image_storage_path text,
  ADD COLUMN IF NOT EXISTS image_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_article_url text,
  ADD COLUMN IF NOT EXISTS content_hash text;

-- 3. Expand category CHECK constraint to include all feed categories
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_category_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_category_check CHECK (
    category IN (
      'andhra-pradesh', 'telangana', 'cinema', 'vizag',
      'technology', 'jobs', 'cricket', 'politics',
      'national', 'international', 'business', 'sports',
      'entertainment', 'health', 'devotional'
    )
  );

-- 4. Create optimized GIN indexes for tags search
CREATE INDEX IF NOT EXISTS blog_posts_image_tags_gin_idx
  ON public.blog_posts USING gin (image_tags);

CREATE INDEX IF NOT EXISTS blog_posts_tags_gin_idx
  ON public.blog_posts USING gin (tags);

-- 5. Create unique index on content_hash for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_content_hash_unique_idx
  ON public.blog_posts (content_hash)
  WHERE content_hash IS NOT NULL;
