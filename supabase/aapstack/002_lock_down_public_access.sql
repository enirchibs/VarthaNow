-- Lock down what the public (anon) key can do on project_vaartanow.
-- The anon key ships inside the app, so anyone can use it. The service role bypasses RLS,
-- so pipelines and scripts are unaffected. Applied as the project owner.

-- Articles: RLS was OFF, so anyone could insert/edit/delete. Public reads published posts only;
-- writes are limited to admins (same rule VaartaNow had on Supabase) and the service role.
alter table blog_posts enable row level security;
drop policy if exists "Admins manage blog_posts" on blog_posts;
create policy "Admins manage blog_posts" on blog_posts for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- News feeds: RLS was OFF. Public may read; only the service role writes.
alter table rss_feeds enable row level security;
drop policy if exists "rss_feeds readable" on rss_feeds;
create policy "rss_feeds readable" on rss_feeds for select to anon, authenticated using (true);

-- "Service role" policies that were actually granted to PUBLIC (everyone). The service role
-- bypasses RLS anyway, so these only ever opened the tables to the world.
drop policy if exists "Allow service_role full access to jobs" on jobs;
drop policy if exists "Service role full access to pipeline_jobs" on pipeline_jobs;
drop policy if exists "Service role full access to pipeline_failures" on pipeline_failures;

-- Health chat logs: anyone could read everyone's health questions. Visitors may only add rows.
drop policy if exists "Allow public read/write chat_history" on health_chat_history;
drop policy if exists "health_chat_history insert only" on health_chat_history;
create policy "health_chat_history insert only" on health_chat_history for insert to anon, authenticated with check (true);

-- Health Q&A: readable by all, editable by nobody but the service role.
drop policy if exists "Allow public read/write health_questions" on health_questions;
drop policy if exists "health_questions readable" on health_questions;
create policy "health_questions readable" on health_questions for select to anon, authenticated using (true);

-- Sellers' phone numbers were publicly readable. Keep inserts (OTP verification), remove reads.
drop policy if exists "Public read verified_contacts" on verified_contacts;
