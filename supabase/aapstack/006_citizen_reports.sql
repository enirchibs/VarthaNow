-- Citizen journalism: signed-in citizens send local news and public issues (with photos,
-- videos and a voice note); editors review them in the admin Review Queue and publish
-- approved ones as articles. Admins can appoint trusted citizens as "citizen reporters".

create table if not exists citizen_reporters (
  user_id      uuid primary key,
  name         text not null,
  phone        text,
  area         text,
  status       text not null default 'active' check (status in ('active', 'revoked')),
  appointed_by text,
  appointed_at timestamptz not null default now()
);

create table if not exists citizen_reports (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in ('news', 'issue')),
  title             text,
  description       text not null check (length(description) between 10 and 5000),
  area              text,
  media             jsonb not null default '[]'::jsonb,   -- [{ "url": "...", "type": "image" | "video" }]
  voice_url         text,
  reporter_id       uuid not null default auth.uid(),
  reporter_name     text,
  reporter_phone    text,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note       text,
  reviewed_by       text,
  reviewed_at       timestamptz,
  published_post_id uuid,
  created_at        timestamptz not null default now()
);
create index if not exists citizen_reports_status_idx on citizen_reports (status, created_at desc);
create index if not exists citizen_reports_reporter_idx on citizen_reports (reporter_id, created_at desc);

alter table citizen_reports enable row level security;
alter table citizen_reporters enable row level security;

-- citizens: submit their own reports and see only their own
drop policy if exists "citizens submit reports" on citizen_reports;
create policy "citizens submit reports" on citizen_reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'pending');
drop policy if exists "citizens read own reports" on citizen_reports;
create policy "citizens read own reports" on citizen_reports for select to authenticated
  using (reporter_id = auth.uid());

-- admins: everything
drop policy if exists "admins manage reports" on citizen_reports;
create policy "admins manage reports" on citizen_reports for all to authenticated
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

drop policy if exists "reporters read own appointment" on citizen_reporters;
create policy "reporters read own appointment" on citizen_reporters for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "admins manage reporters" on citizen_reporters;
create policy "admins manage reporters" on citizen_reporters for all to authenticated
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');
