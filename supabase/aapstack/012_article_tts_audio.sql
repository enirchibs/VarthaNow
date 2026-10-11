-- AI-voiced Telugu reading of each published article (generated once by scripts/article-audio.ts,
-- stored as MP3 in news-media/tts/). The editor's own recording (audio_url) always takes priority.
-- Applied to project_vaartanow on aapstack.tech as the project owner. Safe to run twice.
alter table blog_posts add column if not exists tts_audio_url text;
