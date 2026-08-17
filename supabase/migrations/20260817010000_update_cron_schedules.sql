-- ============================================================================
-- Migration: Update pg_cron schedules for category-specific news ingestion
-- ============================================================================

-- Unschedule previous monolithic cron job and old ingest scheduler conditionally if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varthanow-auto-news-every-hour') THEN
    PERFORM cron.unschedule('varthanow-auto-news-every-hour');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varthanow-ingest-rss-every-2-hours') THEN
    PERFORM cron.unschedule('varthanow-ingest-rss-every-2-hours');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-breaking') THEN
    PERFORM cron.unschedule('ingest-breaking');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-politics') THEN
    PERFORM cron.unschedule('ingest-politics');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-cinema') THEN
    PERFORM cron.unschedule('ingest-cinema');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-business') THEN
    PERFORM cron.unschedule('ingest-business');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ingest-health') THEN
    PERFORM cron.unschedule('ingest-health');
  END IF;
END
$$;

-- Ingest breaking news (every 1 minute)
SELECT cron.schedule(
  'ingest-breaking',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{"category": "breaking"}'::jsonb
  );
  $$
);

-- Ingest politics, AP & Telangana (every 15 minutes)
SELECT cron.schedule(
  'ingest-politics',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{"category": "politics"}'::jsonb
  );
  $$
);

-- Ingest cinema/entertainment (every 1 hour)
SELECT cron.schedule(
  'ingest-cinema',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{"category": "cinema"}'::jsonb
  );
  $$
);

-- Ingest business/trading (every 15 minutes during Indian Market Hours, Mon-Fri: 9:15 AM to 3:30 PM IST ~ 4:00 AM to 10:00 AM UTC)
SELECT cron.schedule(
  'ingest-business',
  '*/15 4-10 * * 1-5',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{"category": "business"}'::jsonb
  );
  $$
);

-- Ingest health & lifestyle (every 4 hours)
SELECT cron.schedule(
  'ingest-health',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{"category": "health"}'::jsonb
  );
  $$
);
