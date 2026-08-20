-- ============================================================================
-- Migration: Update Viral Shorts (Every 5 mins) & Breaking News (Every 1 min)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedules old jobs if exists
DO $$
BEGIN
  PERFORM cron.unschedule('worker-viral-shorts');
  PERFORM cron.unschedule('varthanow-viral-videos-every-hour');
  PERFORM cron.unschedule('ingest-breaking');
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- 1. Schedule Breaking News Ingestion EVERY 1 MINUTE (* * * * *)
SELECT cron.schedule(
  'ingest-breaking',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=breaking&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "breaking"}'::jsonb
  );
  $$
);

-- 2. Schedule Viral Shorts Ingestion EVERY 5 MINUTES (*/5 * * * *)
SELECT cron.schedule(
  'worker-viral-shorts-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/youtube-proxy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{}'::jsonb
  );
  $$
);
