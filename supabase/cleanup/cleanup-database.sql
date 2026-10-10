-- ═══════════════════════════════════════════════════════════════════
--  VaartaNow — database cleanup (fake/sample data, old news, AI caches, logs)
--
--  HOW TO RUN (Supabase Dashboard → SQL Editor, or psql):
--    1. Take a backup first.
--    2. Run PART 1 alone and review the numbers.
--    3. Run PART 2. It ends in ROLLBACK, so the first run changes nothing and
--       only prints what WOULD be deleted. When the counts look right, change
--       the last line to COMMIT and run PART 2 again.
--
--  Images are NOT deleted here: deleting storage.objects with SQL leaves the
--  files in the bucket and frees no space. Use scripts/cleanup-storage.ts.
--
--  Retention (edit in PART 2 if needed):
--    news articles ......... 90 days  (featured and bookmarked posts are kept)
--    raw ingested articles . 30 days
--    AI / TTS / geo caches . 30 days  (ai_cache: everything)
--    logs & job history .... 14–30 days
-- ═══════════════════════════════════════════════════════════════════


-- ─── PART 1: PREVIEW (read-only) ────────────────────────────────────
select pg_size_pretty(pg_database_size(current_database())) as database_size;

select n.nspname || '.' || c.relname as table_name,
       pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
       c.reltuples::bigint as approx_rows
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r', 'p') and n.nspname in ('public', 'storage', 'auth', 'cron', 'net')
order by pg_total_relation_size(c.oid) desc
limit 30;

-- Storage usage per bucket (metadata only; the files themselves are what count toward the quota)
select bucket_id,
       count(*) as files,
       pg_size_pretty(sum(coalesce((metadata ->> 'size')::bigint, 0))) as total_size,
       min(created_at) as oldest,
       max(created_at) as newest
from storage.objects
group by bucket_id
order by sum(coalesce((metadata ->> 'size')::bigint, 0)) desc;


-- ─── PART 2: CLEANUP (transaction; ROLLBACK until you switch to COMMIT) ─
begin;

create temporary table cleanup_report (step text, rows_deleted bigint) on commit drop;

-- Small helper: run a DELETE and record how many rows it removed.
-- Skips tables that don't exist in this project instead of failing the whole run.
create or replace function pg_temp.purge(step text, stmt text) returns void
language plpgsql as $$
declare n bigint;
begin
  execute stmt;
  get diagnostics n = row_count;
  insert into cleanup_report values (step, n);
exception when undefined_table or undefined_column then
  insert into cleanup_report values (step || ' (skipped: table/column missing)', 0);
end $$;

-- 1. Fake / sample data ------------------------------------------------
-- Hard-coded fallback jobs from scripts/populate-jobs.ts (made-up apply links).
select pg_temp.purge('fake jobs (vaartanow_jobs)', $q$
  delete from public.vaartanow_jobs
  where apply_link in (
    'https://tcs.com/careers/react-dev-1',
    'https://wipro.com/careers/node-intern-hyderabad',
    'https://infosys.com/careers/flutter-vizag',
    'mailto:careers@vaartanow.in?subject=Senior UI/UX Designer')
     or job_id like 'local-job-%'
$q$);

-- Template articles from the removed src/lib/demo-data.ts, if they were ever saved.
select pg_temp.purge('demo news posts (blog_posts)', $q$
  delete from public.blog_posts
  where author_name = 'VaartaNow AI Editor'
    and slug ~ '^[a-z-]+-news-(te|en|hi|ta|kn)$'
$q$);

-- Seed listings from the removed SEED_CLASSIFIEDS / SEED_SERVICE_PROVIDERS lists.
select pg_temp.purge('seed classifieds', $q$
  delete from public.classifieds where id::text like 'cf\_%'
$q$);
select pg_temp.purge('seed service providers', $q$
  delete from public.service_providers where id::text like 'sp\_%'
$q$);

-- Unpublished drafts / failed AI rewrites older than 7 days.
select pg_temp.purge('stale unpublished posts', $q$
  delete from public.blog_posts
  where published = false and created_at < now() - interval '7 days'
$q$);

-- 2. Old news ---------------------------------------------------------
-- notifications.article_id has no ON DELETE CASCADE, so clear old notifications first.
select pg_temp.purge('old notifications', $q$
  delete from public.notifications where created_at < now() - interval '30 days'
$q$);

select pg_temp.purge('old blog_posts (>90d, not featured)', $q$
  delete from public.blog_posts
  where published_at < now() - interval '90 days'
    and coalesce(featured, false) = false
$q$);

-- Raw ingested source articles (cascades to ai_summaries, translations, reactions, polls, comments).
-- Bookmarked articles are kept.
select pg_temp.purge('old raw articles (>30d, not bookmarked)', $q$
  delete from public.articles a
  where a.created_at < now() - interval '30 days'
    and not exists (select 1 from public.bookmarks b where b.article_id = a.id)
    and not exists (select 1 from public.notifications n where n.article_id = a.id)
$q$);

select pg_temp.purge('old viral videos (>30d)', $q$
  delete from public.viral_videos where created_at < now() - interval '30 days'
$q$);

-- 3. AI and other caches (all rebuilt on demand) -----------------------
select pg_temp.purge('ai_cache (all)',            $q$ delete from public.ai_cache $q$);
select pg_temp.purge('ai_summaries (>30d)',       $q$ delete from public.ai_summaries where created_at < now() - interval '30 days' $q$);
select pg_temp.purge('tts_audio_cache (>30d)',    $q$ delete from public.tts_audio_cache where created_at < now() - interval '30 days' $q$);
select pg_temp.purge('google_location_cache (>30d)', $q$ delete from public.google_location_cache where created_at < now() - interval '30 days' $q$);

-- 4. Logs and job history ----------------------------------------------
select pg_temp.purge('pipeline_jobs done/failed (>7d)', $q$
  delete from public.pipeline_jobs
  where status in ('done', 'failed', 'completed', 'error') and created_at < now() - interval '7 days'
$q$);
select pg_temp.purge('pipeline_failures (>14d)', $q$ delete from public.pipeline_failures where created_at < now() - interval '14 days' $q$);
select pg_temp.purge('audit_events (>30d)',      $q$ delete from public.audit_events where created_at < now() - interval '30 days' $q$);
select pg_temp.purge('tts_usage_logs (>30d)',    $q$ delete from public.tts_usage_logs where created_at < now() - interval '30 days' $q$);
select pg_temp.purge('health_chat_history (>30d)', $q$ delete from public.health_chat_history where created_at < now() - interval '30 days' $q$);
select pg_temp.purge('gold_rates (>30d)',        $q$ delete from public.gold_rates where fetched_at < now() - interval '30 days' $q$);
select pg_temp.purge('price_history (>90d)',     $q$ delete from public.price_history where observed_at < now() - interval '90 days' $q$);

-- pg_cron and pg_net keep their own run logs, which grow forever with frequent schedules.
select pg_temp.purge('cron.job_run_details (>7d)', $q$ delete from cron.job_run_details where end_time < now() - interval '7 days' $q$);
select pg_temp.purge('net._http_response (all)',   $q$ delete from net._http_response $q$);

select * from cleanup_report order by rows_deleted desc;

ROLLBACK;  -- ← change to COMMIT after reviewing the report above

-- After COMMIT, reclaim disk space so the size actually drops on the usage page:
-- vacuum (full, analyze) public.blog_posts, public.articles, public.ai_cache, public.ai_summaries,
--   public.tts_audio_cache, public.pipeline_jobs, cron.job_run_details, net._http_response;
