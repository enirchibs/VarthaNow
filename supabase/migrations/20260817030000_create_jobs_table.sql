-- ============================================================================
-- Migration: Create public.jobs table for Adzuna API Ingestion
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id            TEXT PRIMARY KEY, -- Adzuna unique ID
  title         TEXT NOT NULL,
  company       TEXT,
  location_name TEXT,
  salary_min    NUMERIC,
  salary_max    NUMERIC,
  redirect_url  TEXT,
  city_category TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for clean-up queries
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs (created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_city_category ON public.jobs (city_category);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to jobs" 
  ON public.jobs FOR SELECT 
  USING (true);

CREATE POLICY "Allow service_role full access to jobs" 
  ON public.jobs FOR ALL 
  USING (true) WITH CHECK (true);

-- Permissions
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO service_role;
