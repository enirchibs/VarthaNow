-- Migration: Add source_logo column to blog_posts
-- Run this in Supabase SQL Editor

alter table public.blog_posts
  add column if not exists source_logo text;

-- Backfill existing rows: derive favicon URL from existing author_name where possible
-- (This is a best-effort backfill; new rows will have it set properly by the ingestion script)
update public.blog_posts
  set source_logo = 'https://www.google.com/s2/favicons?domain=' || lower(replace(replace(author_name, ' ', ''), '.com', '')) || '.com&sz=64'
  where source_logo is null
    and author_name != 'VaartaNow AI Desk'
    and author_name != 'VarthaNow AI Desk';
