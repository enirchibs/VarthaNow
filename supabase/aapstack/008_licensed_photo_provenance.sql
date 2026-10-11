-- Licensed real photos of public figures: provenance, attribution and human review.
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.

alter table image_library
  add column if not exists person_name      text,
  add column if not exists designation      text,
  add column if not exists party            text,
  add column if not exists photo_date       date,
  add column if not exists event_caption    text,
  add column if not exists source_name      text,             -- Wikimedia Commons | Flickr | PIB | I&PR Andhra Pradesh | ...
  add column if not exists source_url       text,             -- the page the photo came from
  add column if not exists author           text,
  add column if not exists license_name     text,             -- exact, e.g. "CC BY-SA 4.0"
  add column if not exists license_url      text,
  add column if not exists attribution_text text,             -- e.g. "Photo: Jane Doe via Wikimedia Commons / CC BY-SA 4.0"
  add column if not exists share_alike      boolean not null default false,
  add column if not exists terms_note       text,             -- where the reuse terms were checked (government / party material)
  add column if not exists retrieved_at     timestamptz,
  add column if not exists review_status    text not null default 'approved',  -- existing rows stay approved
  add column if not exists review_notes     jsonb,            -- Gemini tagging notes: faces, watermark, suitability
  add column if not exists reviewed_by      text,
  add column if not exists reviewed_at      timestamptz,
  add column if not exists takedown_reason  text,
  add column if not exists original_sha256  text unique;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'image_library_review_status_check') then
    alter table image_library add constraint image_library_review_status_check
      check (review_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;
create index if not exists image_library_review_idx on image_library (review_status, created_at desc);
create index if not exists image_library_person_name_idx on image_library (person_name);

-- Public sees only active, approved photos; admins also see pending/rejected ones to review them.
drop policy if exists "image_library readable" on image_library;
create policy "image_library readable" on image_library for select to anon, authenticated
  using (active and review_status = 'approved');
drop policy if exists "Admins read all images" on image_library;
create policy "Admins read all images" on image_library for select to authenticated using (is_admin());

-- Admins approve / reject / take down from the admin UI. Only review columns are writable; inserts stay service-role only.
drop policy if exists "Admins review images" on image_library;
create policy "Admins review images" on image_library for update to authenticated
  using (is_admin()) with check (is_admin());
grant update (review_status, reviewed_by, reviewed_at, active, takedown_reason) on image_library to authenticated;

-- Exact photo credits for each article image: [{ attribution_text, license_url, source_url }]
alter table blog_posts add column if not exists image_credits jsonb;
