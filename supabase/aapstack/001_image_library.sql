-- VaartaNow image library: tagged photos (people, places, topics, categories) that news images are built from.
-- Applied to project_vaartanow on aapstack.tech as the project owner.
create table if not exists image_library (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('person', 'place', 'topic', 'category')),
  label        text not null,                         -- e.g. "N. Chandrababu Naidu", "RK Beach, Visakhapatnam"
  tags         text[] not null,                       -- lowercase match keys: {cbn, chandrababu naidu, chandrababu}
  storage_path text not null unique,                  -- path inside the news-images bucket
  public_url   text not null,
  credit       text not null,                         -- who owns the photo / where it came from
  license      text not null default 'own',           -- own | govt-press-release | stock-free | licensed
  focus        text not null default 'center' check (focus in ('left', 'center', 'right', 'top')),
  times_used   integer not null default 0,
  last_used_at timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists image_library_tags_idx on image_library using gin (tags);

alter table image_library enable row level security;
drop policy if exists "image_library readable" on image_library;
create policy "image_library readable" on image_library for select to anon, authenticated using (active);
revoke all on image_library from anon, authenticated;
grant select on image_library to anon, authenticated;
grant all on image_library to service_role;
