-- Editorial review queue + human-presented audio/video for news articles.
-- Pipeline articles arrive as drafts (published = false, review_status = 'draft');
-- an editor edits, optionally records voice/video, then approves (publishes) or rejects.

alter table blog_posts
  add column if not exists review_status text not null default 'approved',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists presenter_name text,
  add column if not exists ai_assisted boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_posts_review_status_check') then
    alter table blog_posts add constraint blog_posts_review_status_check
      check (review_status in ('draft', 'approved', 'rejected'));
  end if;
end $$;

create index if not exists blog_posts_review_queue_idx on blog_posts (review_status, created_at desc);

-- articles written by the automated pipeline so far
update blog_posts set ai_assisted = true where author_name = 'VaartaNow Desk' and not ai_assisted;
