-- ============================================================================
-- Migration: Reschedule AI and Social workers to faster intervals
-- ============================================================================

-- Unschedule old worker cron names conditionally
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varthanow-process-ai-queue-every-2-minutes') THEN
    PERFORM cron.unschedule('varthanow-process-ai-queue-every-2-minutes');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varthanow-social-worker-every-5-minutes') THEN
    PERFORM cron.unschedule('varthanow-social-worker-every-5-minutes');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'worker-ai') THEN
    PERFORM cron.unschedule('worker-ai');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'worker-social') THEN
    PERFORM cron.unschedule('worker-social');
  END IF;
END
$$;

-- 1. AI Queue Processor: Every 1 minute
SELECT cron.schedule(
  'worker-ai',
  '* * * * *',
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

-- 2. Telegram Social & Sitemap Worker: Every 2 minutes
SELECT cron.schedule(
  'worker-social',
  '*/2 * * * *',
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
