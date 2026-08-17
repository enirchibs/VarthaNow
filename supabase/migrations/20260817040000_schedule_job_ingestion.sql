-- ============================================================================
-- Migration: Schedule Adzuna Job Ingestion Cron Job
-- ============================================================================

-- Unschedule if already exists conditionally
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-adzuna-jobs') THEN
    PERFORM cron.unschedule('ingest-adzuna-jobs');
  END IF;
END
$$;

-- Schedule Adzuna Job Ingestion: Every night at 2:00 AM UTC (7:30 AM IST)
SELECT cron.schedule(
  'ingest-adzuna-jobs',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
