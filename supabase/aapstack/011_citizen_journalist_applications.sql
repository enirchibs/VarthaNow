-- "Join as a citizen journalist" (సిటిజన్ జర్నలిస్ట్‌గా చేరండి): signed-in citizens apply from the site;
-- editors and admins approve (which appoints them in citizen_reporters) or reject with a note.
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.

create table if not exists citizen_journalist_applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  name        text not null check (length(trim(name)) between 2 and 80),
  phone       text not null check (length(regexp_replace(phone, '\D', '', 'g')) between 10 and 13),
  email       text,
  state       text not null,
  district    text not null check (length(trim(district)) between 2 and 60),
  area        text not null check (length(trim(area)) between 2 and 80),
  occupation  text,
  motivation  text not null check (length(trim(motivation)) between 20 and 1500),
  experience  text,
  agreed_guidelines boolean not null check (agreed_guidelines),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
-- at most one open application per person
create unique index if not exists cj_applications_one_pending on citizen_journalist_applications (user_id) where status = 'pending';
create index if not exists cj_applications_status_idx on citizen_journalist_applications (status, created_at desc);

alter table citizen_journalist_applications enable row level security;
drop policy if exists "citizens apply" on citizen_journalist_applications;
create policy "citizens apply" on citizen_journalist_applications for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and review_note is null and reviewed_by is null);
drop policy if exists "citizens read own applications" on citizen_journalist_applications;
create policy "citizens read own applications" on citizen_journalist_applications for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "editors review applications" on citizen_journalist_applications;
create policy "editors review applications" on citizen_journalist_applications for select to authenticated using (is_editor());
drop policy if exists "editors decide applications" on citizen_journalist_applications;
create policy "editors decide applications" on citizen_journalist_applications for update to authenticated
  using (is_editor()) with check (is_editor());
revoke all on citizen_journalist_applications from anon;
grant select, insert, update on citizen_journalist_applications to authenticated;

-- Approve: appoint the applicant as a citizen journalist and close the application (editors/admins).
create or replace function approve_journalist_application(application uuid, note text default null) returns citizen_reporters
  language plpgsql security definer set search_path = project_vaartanow, pg_temp
as $$
declare app citizen_journalist_applications; result citizen_reporters;
begin
  if not is_editor() then raise exception 'only editors and admins can approve applications'; end if;
  select * into app from citizen_journalist_applications where id = application;
  if app.id is null then raise exception 'application not found'; end if;
  if app.status <> 'pending' then raise exception 'this application was already %', app.status; end if;
  insert into citizen_reporters (user_id, name, phone, area, status, appointed_by)
    values (app.user_id, app.name, app.phone, app.area || ', ' || app.district, 'active', auth.jwt() ->> 'email')
  on conflict (user_id) do update set status = 'active', name = excluded.name, phone = excluded.phone, area = excluded.area,
    appointed_by = excluded.appointed_by, appointed_at = now()
  returning * into result;
  update citizen_journalist_applications set status = 'approved', review_note = nullif(trim(note), ''),
    reviewed_by = auth.jwt() ->> 'email', reviewed_at = now() where id = application;
  return result;
end $$;
revoke all on function approve_journalist_application(uuid, text) from public, anon;
grant execute on function approve_journalist_application(uuid, text) to authenticated;
