-- Create viral_videos table to store fetched YouTube Short videos
CREATE TABLE IF NOT EXISTS public.viral_videos (
  id TEXT PRIMARY KEY, -- YouTube Video ID
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  channel TEXT,
  source_icon TEXT,
  clip TEXT, -- Fallback video file/stream link
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.viral_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to viral videos
DROP POLICY IF EXISTS "Allow public read access to viral videos" ON public.viral_videos;
CREATE POLICY "Allow public read access to viral videos" ON public.viral_videos
  FOR SELECT USING (true);

-- Explicit grants for Post-May 30, 2026 Supabase compliance
GRANT SELECT ON TABLE public.viral_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.viral_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.viral_videos TO service_role;
