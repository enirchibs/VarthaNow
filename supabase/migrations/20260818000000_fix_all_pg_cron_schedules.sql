-- ============================================================================
-- Migration: Staggered Non-Conflicting pg_cron Schedules for 24/7 Automation
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── 1. Clean Up All Existing Cron Jobs ───────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT jobname FROM cron.job LOOP
    PERFORM cron.unschedule(r.jobname);
  END LOOP;
END
$$;

-- ─── 3. Staggered News Ingestion Schedules (Zero Conflict / Load Balanced) ───

-- A. Politics (Every 15 mins at :00, :15, :30, :45)
SELECT cron.schedule(
  'ingest-politics',
  '0,15,30,45 * * * *',
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

-- B. National (Every 15 mins at :02, :17, :32, :47)
SELECT cron.schedule(
  'ingest-national',
  '2,17,32,47 * * * *',
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

-- C. Business (Every 15 mins at :04, :19, :34, :49)
SELECT cron.schedule(
  'ingest-business',
  '4,19,34,49 * * * *',
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

-- D. Andhra Pradesh (Every 20 mins at :06, :26, :46)
SELECT cron.schedule(
  'ingest-andhra-pradesh',
  '6,26,46 * * * *',
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

-- E. Telangana (Every 20 mins at :08, :28, :48)
SELECT cron.schedule(
  'ingest-telangana',
  '8,28,48 * * * *',
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

-- F. Cinema / Entertainment (Every 30 mins at :12, :42)
SELECT cron.schedule(
  'ingest-cinema',
  '12,42 * * * *',
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

-- G. Technology & Cricket (Every 30 mins at :14, :44)
SELECT cron.schedule(
  'ingest-technology',
  '14,44 * * * *',
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

-- H. Health, Devotional & Agriculture (Hourly at :18)
SELECT cron.schedule(
  'ingest-health',
  '18 * * * *',
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

-- I. YouTube Viral Shorts (Every 30 mins at :05, :35)
SELECT cron.schedule(
  'worker-viral-shorts',
  '5,35 * * * *',
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

-- J. Catch-All Feed Refresh (Every 30 mins at :25, :55)
SELECT cron.schedule(
  'ingest-all-catchall',
  '25,55 * * * *',
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

-- ─── 6. Reset RSS Feed Timestamps ─────────────────────────────────────────────
UPDATE public.rss_feeds 
SET next_fetch_time = NOW() - INTERVAL '1 minute',
    consecutive_failures = 0;
