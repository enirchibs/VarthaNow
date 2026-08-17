-- ============================================================================
-- Migration: Native Three-Layer news pipeline setup
-- Defines grab_next_job locking queue and schedules edge functions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── 1. Define Row-Level Locking Queue function ─────────────────────────────
CREATE OR REPLACE FUNCTION public.grab_next_job(
  target_job_types text[],
  lock_duration interval DEFAULT interval '5 minutes'
)
RETURNS TABLE (
  id uuid,
  post_slug text,
  job_type text,
  status text,
  priority int,
  retry_count int,
  max_retries int,
  scheduled_at timestamptz,
  payload jsonb
) AS $$
DECLARE
  next_job_id uuid;
BEGIN
  -- Select and lock the next pending job matching any target type
  SELECT j.id INTO next_job_id
  FROM public.pipeline_jobs j
  WHERE j.job_type = ANY(target_job_types)
    AND j.status IN ('pending', 'failed')
    AND j.scheduled_at <= now()
  ORDER BY j.priority ASC, j.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If a job was found, mark it as processing
  IF next_job_id IS NOT NULL THEN
    UPDATE public.pipeline_jobs j
    SET status = 'processing',
        started_at = now(),
        scheduled_at = now() + lock_duration
    WHERE j.id = next_job_id;

    RETURN QUERY
    SELECT 
      j.id, j.post_slug, j.job_type, j.status, j.priority, 
      j.retry_count, j.max_retries, j.scheduled_at, j.payload
    FROM public.pipeline_jobs j
    WHERE j.id = next_job_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.grab_next_job TO service_role;

-- ─── 2. Reschedule Cron Jobs ──────────────────────────────────────────────────

-- Remove old monolithic cron job if it exists
SELECT cron.unschedule('varthanow-auto-news-every-hour');

-- Ingest RSS (runs every 2 hours at minute 5)
SELECT cron.schedule(
  'varthanow-ingest-rss-every-2-hours',
  '5 */2 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Process AI Queue (runs every 2 minutes)
SELECT cron.schedule(
  'varthanow-process-ai-queue-every-2-minutes',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/process-ai-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Social Worker (runs every 5 minutes)
SELECT cron.schedule(
  'varthanow-social-worker-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/social-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
