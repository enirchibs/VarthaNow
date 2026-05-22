create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'varthanow-auto-news-every-15-minutes',
  '*/15 * * * *',
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
