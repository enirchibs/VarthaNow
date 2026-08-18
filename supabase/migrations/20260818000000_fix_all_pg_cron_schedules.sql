-- ============================================================================
-- Migration: Fix All pg_cron Schedules for Continuous News & AI Ingestion
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── 1. Set Database Config Parameters ───────────────────────────────────────
ALTER DATABASE postgres SET app.supabase_url = 'https://xceartahttbkdihteynx.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8';

-- ─── 2. Clean Up All Existing Cron Jobs ───────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT jobname FROM cron.job LOOP
    PERFORM cron.unschedule(r.jobname);
  END LOOP;
END
$$;

-- ─── 3. Schedule Category-Specific Ingestion Jobs ─────────────────────────────
-- Direct URLs and hardcoded Authorization ensures 100% reliability

-- A. Politics (Every 15 minutes)
SELECT cron.schedule(
  'ingest-politics',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=politics&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "politics"}'::jsonb
  );
  $$
);

-- B. National (Every 15 minutes)
SELECT cron.schedule(
  'ingest-national',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=national&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "national"}'::jsonb
  );
  $$
);

-- C. Andhra Pradesh (Every 20 minutes)
SELECT cron.schedule(
  'ingest-andhra-pradesh',
  '*/20 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=andhra-pradesh&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "andhra-pradesh"}'::jsonb
  );
  $$
);

-- D. Telangana (Every 20 minutes)
SELECT cron.schedule(
  'ingest-telangana',
  '*/20 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=telangana&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "telangana"}'::jsonb
  );
  $$
);

-- E. Cinema (Every 30 minutes)
SELECT cron.schedule(
  'ingest-cinema',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=cinema&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "cinema"}'::jsonb
  );
  $$
);

-- F. Business (Every 15 minutes)
SELECT cron.schedule(
  'ingest-business',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=business&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "business"}'::jsonb
  );
  $$
);

-- G. Technology & Cricket/Sports (Every 30 minutes)
SELECT cron.schedule(
  'ingest-technology',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=technology&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "technology"}'::jsonb
  );
  $$
);

-- H. Health & Devotional & Agriculture (Every 1 hour)
SELECT cron.schedule(
  'ingest-health',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?category=health&force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{"category": "health"}'::jsonb
  );
  $$
);

-- I. Catch-All Ingest (Every 30 minutes at minute 10 and 40)
SELECT cron.schedule(
  'ingest-all-catchall',
  '10,40 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-rss?force=true',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ─── 4. AI Queue Processor (Every 1 minute) ───────────────────────────────────
SELECT cron.schedule(
  'worker-ai-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/process-ai-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ─── 5. Daily Adzuna Jobs Ingest (Every Day at 2:00 AM UTC = 7:30 AM IST) ─────
SELECT cron.schedule(
  'worker-jobs-ingest',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xceartahttbkdihteynx.supabase.co/functions/v1/ingest-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWFydGFodHRia2RpaHRleW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDYzNiwiZXhwIjoyMDk1MDQwNjM2fQ.m24ldLeBmEvy3cvjcLGSp9DMLKJyuEcsHJC2ZXKJsa8'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ─── 6. YouTube Viral Shorts Ingest (Every 30 minutes) ────────────────────────
SELECT cron.schedule(
  'worker-viral-shorts',
  '*/30 * * * *',
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

-- ─── 7. Reset RSS Feed Timestamps ─────────────────────────────────────────────
UPDATE public.rss_feeds 
SET next_fetch_time = NOW() - INTERVAL '1 minute',
    consecutive_failures = 0;

