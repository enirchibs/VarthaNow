-- ============================================================================
-- Migration: Create gold_rates table for OroPocket Gold Ticker Cache
-- ============================================================================

create table if not exists public.gold_rates (
  id bigint generated always as identity primary key,
  gold_24k numeric not null,
  gold_22k numeric not null,
  unit text default 'INR/10g',
  source text default 'OroPocket',
  source_timestamp timestamptz,
  fetched_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.gold_rates enable row level security;

-- Drop policy if exists and create select policy for public frontend
drop policy if exists "Allow public read access to gold_rates" on public.gold_rates;
create policy "Allow public read access to gold_rates" 
  on public.gold_rates 
  for select 
  using (true);

-- Index for ordering by latest fetched_at
create index if not exists idx_gold_rates_fetched_at on public.gold_rates(fetched_at desc);
