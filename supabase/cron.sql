create extension if not exists pg_cron;
create extension if not exists pg_net;

-- News is no longer fetched here: the GitHub Actions workflow .github/workflows/news-pipeline.yml
-- (scripts/news-shorts.ts) runs every 3 hours and saves drafts for editorial review.
-- If this server still has the old job, remove it once:
--   select cron.unschedule('varthanow-auto-news-every-hour');

-- Viral Videos Job (runs every 5 minutes)
select cron.schedule(
  'varthanow-viral-videos-every-hour',
  '*/5 * * * *',
  $$
  select
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/youtube-proxy',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);
