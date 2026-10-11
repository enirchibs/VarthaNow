-- Recorded article videos are copied to the VaartaNow YouTube channel (scripts/youtube-upload.ts).
-- Once YouTube has processed a public upload, video_url switches to the YouTube link and the copy in
-- news-media is deleted to free VPS space.
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.
alter table blog_posts
  add column if not exists youtube_video_id text,
  add column if not exists youtube_status text,          -- uploaded | processing | live | private | failed
  add column if not exists youtube_error text,
  add column if not exists youtube_uploaded_at timestamptz,
  add column if not exists local_video_url text;         -- our copy, kept until the YouTube video is live

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_posts_youtube_status_check') then
    alter table blog_posts add constraint blog_posts_youtube_status_check
      check (youtube_status is null or youtube_status in ('uploaded', 'processing', 'live', 'private', 'failed'));
  end if;
end $$;
create index if not exists blog_posts_youtube_pending_idx on blog_posts (youtube_status) where video_url is not null;
