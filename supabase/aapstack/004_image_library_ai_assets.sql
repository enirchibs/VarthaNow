-- ═══════════════════════════════════════════════════════════════════
-- VaartaNow Image Library — AI Assets Schema Extension
-- Applied to project_vaartanow on aapstack.tech as project owner
-- Idempotent: safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════

alter table image_library
  add column if not exists asset_code text unique,
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists subcategory text,
  add column if not exists description text,
  add column if not exists prompt text,
  add column if not exists negative_prompt text,
  add column if not exists keywords_en text[] default '{}',
  add column if not exists keywords_te text[] default '{}',
  add column if not exists location_tags text[] default '{}',
  add column if not exists person_tags text[] default '{}',
  add column if not exists topic_tags text[] default '{}',
  add column if not exists image_style text,
  add column if not exists aspect_ratio text,
  add column if not exists generation_provider text,
  add column if not exists generation_model text,
  add column if not exists generation_status text default 'uploaded',
  add column if not exists is_ai_generated boolean not null default false,
  add column if not exists editorial_label text,
  add column if not exists rights_status text,
  add column if not exists prompt_hash text,
  add column if not exists image_hash text,
  add column if not exists width int,
  add column if not exists height int,
  add column if not exists updated_at timestamptz default now();

-- Constraint on generation_status
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'image_library_generation_status_check'
  ) then
    alter table image_library
      add constraint image_library_generation_status_check
      check (generation_status in ('pending', 'generated', 'uploaded', 'failed', 'duplicate'));
  end if;
end $$;

-- GIN indexes for tag matching and searches
create index if not exists image_library_tags_gin_idx on image_library using gin (tags);
create index if not exists image_library_keywords_te_gin_idx on image_library using gin (keywords_te);
create index if not exists image_library_keywords_en_gin_idx on image_library using gin (keywords_en);
create index if not exists image_library_asset_code_idx on image_library (asset_code);
create index if not exists image_library_generation_status_idx on image_library (generation_status);
create index if not exists image_library_active_ai_idx on image_library (active, is_ai_generated, generation_status);
