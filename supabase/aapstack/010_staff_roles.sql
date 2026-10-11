-- Roles: admin, editor and citizen journalist.
--   admin             everything, including managing people and roles
--   editor            newsroom: write/edit/approve articles, review citizen reports and photos, galleries,
--                     appoint citizen journalists (no deleting articles, no settings, no roles)
--   citizen journalist appointed citizen (citizen_reporters); submits reports for review
-- Roles are tied to the account (user id), never to a typed email: a person must sign in once
-- before they can be given a role. The original owner (app_metadata.role = 'admin') stays admin.
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.

create table if not exists staff_roles (
  user_id    uuid primary key,
  email      text,
  name       text,
  role       text not null check (role in ('admin', 'editor')),
  added_by   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table staff_roles enable row level security;

-- Role of the signed-in user from the staff table (security definer: reads it without RLS).
create or replace function staff_role() returns text
  language sql stable security definer set search_path = project_vaartanow, pg_temp
  as $$ select role from staff_roles where user_id = auth.uid() $$;

create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = project_vaartanow, pg_temp
  as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) or coalesce(staff_role() = 'admin', false) $$;

create or replace function is_editor() returns boolean
  language sql stable security definer set search_path = project_vaartanow, pg_temp
  as $$ select is_admin() or coalesce(staff_role() = 'editor', false) $$;

-- What the admin screen shows for the signed-in user: 'admin' | 'editor' | 'citizen' | null
create or replace function my_role() returns text
  language sql stable security definer set search_path = project_vaartanow, pg_temp
  as $$ select case when is_admin() then 'admin' when is_editor() then 'editor'
               when exists (select 1 from citizen_reporters where user_id = auth.uid() and status = 'active') then 'citizen'
               end $$;

-- Find an existing account by email or 10-digit phone (admins/editors only).
create or replace function find_account(identifier text) returns table (user_id uuid, email text, phone text)
  language plpgsql stable security definer set search_path = project_vaartanow, pg_temp
as $$
begin
  if not is_editor() then raise exception 'not allowed'; end if;
  return query
    select u.id, u.email::text, u.phone::text from auth.users u
    where (position('@' in identifier) > 0 and lower(u.email) = lower(trim(identifier)))
       or (position('@' in identifier) = 0 and length(phone10(identifier)) = 10 and phone10(u.phone) = phone10(identifier))
    limit 1;
end $$;

-- Give someone a staff role (admins only).
create or replace function grant_staff_role(identifier text, new_role text, display_name text default null) returns staff_roles
  language plpgsql security definer set search_path = project_vaartanow, pg_temp
as $$
declare acc record; result staff_roles;
begin
  if not is_admin() then raise exception 'only admins can change roles'; end if;
  if new_role not in ('admin', 'editor') then raise exception 'role must be admin or editor'; end if;
  select * into acc from find_account(identifier);
  if acc.user_id is null then raise exception 'no account found for %: ask them to sign in to VaartaNow once first', identifier; end if;
  insert into staff_roles (user_id, email, name, role, added_by)
    values (acc.user_id, acc.email, nullif(trim(display_name), ''), new_role, auth.jwt() ->> 'email')
  on conflict (user_id) do update set role = excluded.role, name = coalesce(excluded.name, staff_roles.name),
    email = excluded.email, updated_at = now()
  returning * into result;
  return result;
end $$;

create or replace function revoke_staff_role(target uuid) returns void
  language plpgsql security definer set search_path = project_vaartanow, pg_temp
as $$
begin
  if not is_admin() then raise exception 'only admins can change roles'; end if;
  if target = auth.uid() then raise exception 'you cannot remove your own role'; end if;
  delete from staff_roles where user_id = target;
end $$;

-- Appoint a citizen journalist by email or phone (admins and editors).
create or replace function appoint_citizen_journalist(identifier text, display_name text, area_name text default null) returns citizen_reporters
  language plpgsql security definer set search_path = project_vaartanow, pg_temp
as $$
declare acc record; result citizen_reporters;
begin
  if not is_editor() then raise exception 'only editors and admins can appoint citizen journalists'; end if;
  select * into acc from find_account(identifier);
  if acc.user_id is null then raise exception 'no account found for %: ask them to sign in to VaartaNow once first', identifier; end if;
  insert into citizen_reporters (user_id, name, phone, area, status, appointed_by)
    values (acc.user_id, coalesce(nullif(trim(display_name), ''), acc.email, acc.phone), acc.phone, nullif(trim(area_name), ''), 'active', auth.jwt() ->> 'email')
  on conflict (user_id) do update set status = 'active', name = excluded.name, area = coalesce(excluded.area, citizen_reporters.area),
    appointed_by = excluded.appointed_by, appointed_at = now()
  returning * into result;
  return result;
end $$;

revoke all on function find_account(text), grant_staff_role(text, text, text), revoke_staff_role(uuid), appoint_citizen_journalist(text, text, text) from public, anon;
grant execute on function staff_role(), is_admin(), is_editor(), my_role(), find_account(text), grant_staff_role(text, text, text),
  revoke_staff_role(uuid), appoint_citizen_journalist(text, text, text) to authenticated;
grant execute on function is_admin(), is_editor() to anon;

-- staff_roles: admins see and manage everyone; each person sees their own row
drop policy if exists "admins manage staff" on staff_roles;
create policy "admins manage staff" on staff_roles for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "staff read own role" on staff_roles;
create policy "staff read own role" on staff_roles for select to authenticated using (user_id = auth.uid());
revoke all on staff_roles from anon;
grant select, insert, update, delete on staff_roles to authenticated;

-- Articles: editors read, write and approve; only admins delete (existing "Admins manage blog_posts")
drop policy if exists "Editors read articles" on blog_posts;
create policy "Editors read articles" on blog_posts for select to authenticated using (is_editor());
drop policy if exists "Editors write articles" on blog_posts;
create policy "Editors write articles" on blog_posts for insert to authenticated with check (is_editor());
drop policy if exists "Editors edit articles" on blog_posts;
create policy "Editors edit articles" on blog_posts for update to authenticated using (is_editor()) with check (is_editor());

-- Citizen reports and journalists: admins and editors (was owner-only via app_metadata)
drop policy if exists "admins manage reports" on citizen_reports;
create policy "admins manage reports" on citizen_reports for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "editors review reports" on citizen_reports;
create policy "editors review reports" on citizen_reports for select to authenticated using (is_editor());
drop policy if exists "editors update reports" on citizen_reports;
create policy "editors update reports" on citizen_reports for update to authenticated using (is_editor()) with check (is_editor());
drop policy if exists "admins manage reporters" on citizen_reporters;
create policy "admins manage reporters" on citizen_reporters for all to authenticated using (is_editor()) with check (is_editor());

-- Image library: editors review, upload and see pending photos too
drop policy if exists "Admins read all images" on image_library;
create policy "Admins read all images" on image_library for select to authenticated using (is_editor());
drop policy if exists "Admins review images" on image_library;
create policy "Admins review images" on image_library for update to authenticated using (is_editor()) with check (is_editor());
drop policy if exists "Admins add images" on image_library;
create policy "Admins add images" on image_library for insert to authenticated with check (is_editor());

-- Admins added on the Users & Roles screen get the same full article rights as the owner (incl. delete)
drop policy if exists "Admins manage blog_posts" on blog_posts;
create policy "Admins manage blog_posts" on blog_posts for all to authenticated using (is_admin()) with check (is_admin());
