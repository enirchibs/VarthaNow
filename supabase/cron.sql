create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1. News Ingestion Job (runs at minute 0 of every hour)
select cron.schedule(
  'varthanow-auto-news-every-hour',
  '0 * * * *',
  $$
  select
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/auto-news',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- 2. Viral Videos Job (runs every 5 minutes)
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
