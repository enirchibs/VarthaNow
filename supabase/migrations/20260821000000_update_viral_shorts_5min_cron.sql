-- ============================================================================
-- Migration: Update Viral Shorts Ingestion Schedule to Every 5 Minutes (*/5 * * * *)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedules old viral shorts job if exists
DO $$
BEGIN
  PERFORM cron.unschedule('worker-viral-shorts');
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

DO $$
BEGIN
  PERFORM cron.unschedule('varthanow-viral-videos-every-hour');
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- Schedule Viral Shorts ingestion EVERY 5 MINUTES
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
