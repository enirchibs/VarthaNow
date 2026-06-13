-- Create public.ai_cache table for caching Gemini summaries
CREATE TABLE IF NOT EXISTS public.ai_cache (
  content_hash TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read/write to ai_cache
DROP POLICY IF EXISTS "Allow public read/write ai_cache" ON public.ai_cache;
CREATE POLICY "Allow public read/write ai_cache" ON public.ai_cache FOR ALL USING (true) WITH CHECK (true);

-- Explicit grants for post-May 30 compliance
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_cache TO anon, authenticated, service_role;
