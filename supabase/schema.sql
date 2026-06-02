create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('andhra-pradesh', 'telangana', 'cinema', 'vizag', 'technology', 'jobs', 'cricket', 'politics')),
  tags text[] not null default '{}',
  meta_title text not null,
  meta_description text not null,
  og_image text,
  author_name text not null default 'VarthaNow AI Desk',
  language text not null default 'te',
  published boolean not null default true,
  featured boolean not null default false,
  reading_time_min int not null default 3,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category, published_at desc);
create index if not exists blog_posts_language_idx on public.blog_posts (language, published_at desc);
create index if not exists blog_posts_featured_idx on public.blog_posts (featured, published_at desc);
create index if not exists blog_posts_search_idx on public.blog_posts using gin (to_tsvector('simple', title || ' ' || excerpt || ' ' || content));

alter table public.blog_posts enable row level security;

create policy "Public can read published blog posts"
  on public.blog_posts for select
  using (published = true);

create policy "Admins can manage blog posts"
  on public.blog_posts for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create type public.article_status as enum ('draft', 'queued', 'published', 'rejected');
create type public.notification_priority as enum ('low', 'medium', 'high');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  language text not null default 'te',
  state text,
  city text,
  locality text,
  dark_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  telugu_name text not null,
  sort_order int not null default 0
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  name text not null,
  locality text,
  lat numeric,
  lng numeric,
  unique (state, name, locality)
);

create table public.scraping_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  kind text not null check (kind in ('rss', 'api', 'playwright')),
  category_id uuid references public.categories(id),
  city_id uuid references public.cities(id),
  enabled boolean not null default true,
  last_scraped_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.scraping_sources(id),
  category_id uuid references public.categories(id),
  city_id uuid references public.cities(id),
  headline text not null,
  source_name text not null,
  source_url text not null,
  image_url text,
  canonical_url text,
  content_hash text unique,
  status public.article_status not null default 'queued',
  published_at timestamptz,
  trending_score numeric not null default 0,
  is_breaking boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  language text not null default 'te',
  ten_second text not null,
  one_minute text not null,
  full_explanation text not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique(article_id, language)
);

create table public.article_translations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  language text not null,
  headline text not null,
  summary text not null,
  created_at timestamptz not null default now(),
  unique(article_id, language)
);

create table public.bookmarks (
  user_id uuid references public.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  unique(user_id, article_id, reaction)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null,
  priority public.notification_priority not null default 'medium',
  city_id uuid references public.cities(id),
  article_id uuid references public.articles(id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null,
  job_type text not null,
  salary text,
  apply_url text not null,
  deadline date,
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  property_type text not null,
  location text not null,
  price text not null,
  image_url text,
  contact_phone text,
  created_at timestamptz not null default now()
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  question text not null,
  options jsonb not null,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  body text not null,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  city_id uuid references public.cities(id),
  title text not null,
  description text not null,
  media_urls text[] default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.comments;

alter table public.users enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.user_reports enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can create own profile" on public.users for insert with check (auth.uid() = id);

create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reactions" on public.reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can read approved comments" on public.comments for select using (moderation_status = 'approved' or auth.uid() = user_id);
create policy "Users create local reports" on public.user_reports for insert with check (auth.uid() = user_id);

create index articles_published_idx on public.articles (status, published_at desc);
create index articles_trending_idx on public.articles (trending_score desc);
create index article_translations_lookup_idx on public.article_translations (article_id, language);
create index ai_summaries_lookup_idx on public.ai_summaries (article_id, language);

-- ============================================================================
-- EXPLICIT GRANTS FOR POST-MAY 30, 2026 SUPABASE COMPLIANCE
-- ============================================================================
GRANT SELECT ON TABLE public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO service_role;

GRANT SELECT ON TABLE public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO service_role;

GRANT SELECT ON TABLE public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO service_role;

GRANT SELECT ON TABLE public.cities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cities TO service_role;

GRANT SELECT ON TABLE public.scraping_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scraping_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scraping_sources TO service_role;

GRANT SELECT ON TABLE public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.articles TO service_role;

GRANT SELECT ON TABLE public.ai_summaries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_summaries TO service_role;

GRANT SELECT ON TABLE public.article_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_translations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_translations TO service_role;

GRANT SELECT ON TABLE public.bookmarks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bookmarks TO service_role;

GRANT SELECT ON TABLE public.reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reactions TO service_role;

GRANT SELECT ON TABLE public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO service_role;

GRANT SELECT ON TABLE public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.jobs TO service_role;

GRANT SELECT ON TABLE public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.properties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.properties TO service_role;

GRANT SELECT ON TABLE public.polls TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.polls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.polls TO service_role;

GRANT SELECT ON TABLE public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO service_role;

GRANT SELECT ON TABLE public.user_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_reports TO service_role;

