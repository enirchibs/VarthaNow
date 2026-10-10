-- Jobs and classifieds: replace "anyone can do anything" policies with ownership rules.
-- Identity comes from the signed-in user's token (owndatabase puts `phone` and `app_metadata` in it).
-- The service role bypasses RLS, so the job pipeline is unaffected. Applied as the project owner.

-- Helpers ------------------------------------------------------------------
-- Last 10 digits of a phone number (+91 98765 43210 → 9876543210).
create or replace function phone10(p text) returns text
  language sql immutable as $$ select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10) $$;

-- Admin = signed-in user whose server-set app_metadata.role is "admin".
create or replace function is_admin() returns boolean
  language sql stable as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) $$;

-- Jobs ---------------------------------------------------------------------
-- New rows must start unapproved unless an admin or the service role says otherwise.
alter table vaartanow_jobs alter column is_approved set default false;
alter table vaartanow_jobs alter column is_featured set default false;

drop policy if exists "Allow admin full access" on vaartanow_jobs;          -- was granted to PUBLIC
drop policy if exists "Visitors submit pending jobs" on vaartanow_jobs;
drop policy if exists "Admins manage jobs" on vaartanow_jobs;

-- Anyone may submit a job, but only as pending: not approved, not featured.
create policy "Visitors submit pending jobs" on vaartanow_jobs for insert to anon, authenticated
  with check (is_approved = false and is_featured = false);

-- Approving, featuring, editing and deactivating is admin-only (reads of pending jobs too).
create policy "Admins manage jobs" on vaartanow_jobs for all to authenticated
  using (is_admin()) with check (is_admin());

-- Classifieds ----------------------------------------------------------------
drop policy if exists "Public insert classifieds" on classifieds;
drop policy if exists "Public update classifieds" on classifieds;
drop policy if exists "Public delete classifieds" on classifieds;
drop policy if exists "Sellers create own listings" on classifieds;
drop policy if exists "Sellers update own listings" on classifieds;
drop policy if exists "Sellers delete own listings" on classifieds;
drop policy if exists "Sellers see own listings" on classifieds;
drop policy if exists "Admins manage classifieds" on classifieds;

-- A seller signed in by phone OTP owns the listings whose contact number is their phone.
create policy "Sellers create own listings" on classifieds for insert to authenticated
  with check (length(phone10(contact)) = 10 and phone10(contact) = phone10(auth.jwt() ->> 'phone'));
create policy "Sellers update own listings" on classifieds for update to authenticated
  using (phone10(contact) = phone10(auth.jwt() ->> 'phone'))
  with check (phone10(contact) = phone10(auth.jwt() ->> 'phone'));
create policy "Sellers delete own listings" on classifieds for delete to authenticated
  using (phone10(contact) = phone10(auth.jwt() ->> 'phone'));
-- Sellers can also see their own sold / inactive listings.
create policy "Sellers see own listings" on classifieds for select to authenticated
  using (phone10(contact) = phone10(auth.jwt() ->> 'phone'));

create policy "Admins manage classifieds" on classifieds for all to authenticated
  using (is_admin()) with check (is_admin());
