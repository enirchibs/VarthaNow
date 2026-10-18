-- News fetching moved to GitHub Actions (.github/workflows/news-pipeline.yml → scripts/news-shorts.ts),
-- which saves every story as a draft for the admin Review Queue. The old edge functions auto-news and
-- ingest-rss published directly and copied source outlets' photos; they are removed from the repo.
-- This drops any leftover schedules that still call them. Safe to run twice; does nothing without pg_cron.
-- After running it, also delete the deployed functions auto-news, ingest-rss and ingest-news on the server.
do $$
declare j record;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    for j in
      select jobid, jobname from cron.job
      where command ilike '%/functions/v1/auto-news%'
         or command ilike '%/functions/v1/ingest-rss%'
         or command ilike '%/functions/v1/ingest-news%'
    loop
      perform cron.unschedule(j.jobid);
      raise notice 'unscheduled cron job % (%)', j.jobid, j.jobname;
    end loop;
  else
    raise notice 'pg_cron is not installed: no schedules to remove';
  end if;
end $$;
