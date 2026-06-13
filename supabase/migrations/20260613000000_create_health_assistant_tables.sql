-- Create public.health_tips table
CREATE TABLE IF NOT EXISTS public.health_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- General, Heart, Mental, Senior, Child, Women, etc.
  tip_type TEXT DEFAULT 'daily', -- daily, weekly, seasonal
  language TEXT DEFAULT 'te', -- 'te' or 'en'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public.medicine_information table
CREATE TABLE IF NOT EXISTS public.medicine_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  common_uses TEXT NOT NULL,
  typical_dosage TEXT NOT NULL,
  side_effects TEXT NOT NULL,
  warnings TEXT NOT NULL,
  drug_interactions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public.health_questions table
CREATE TABLE IF NOT EXISTS public.health_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public.health_chat_history table
CREATE TABLE IF NOT EXISTS public.health_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  language TEXT DEFAULT 'te',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.health_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_chat_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tips and medicines
DROP POLICY IF EXISTS "Allow public read health_tips" ON public.health_tips;
CREATE POLICY "Allow public read health_tips" ON public.health_tips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read medicine_info" ON public.medicine_information;
CREATE POLICY "Allow public read medicine_info" ON public.medicine_information FOR SELECT USING (true);

-- Allow public read/write to questions and chat history
DROP POLICY IF EXISTS "Allow public read/write health_questions" ON public.health_questions;
CREATE POLICY "Allow public read/write health_questions" ON public.health_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write chat_history" ON public.health_chat_history;
CREATE POLICY "Allow public read/write chat_history" ON public.health_chat_history FOR ALL USING (true) WITH CHECK (true);

-- Explicit grants for compliance
GRANT SELECT ON TABLE public.health_tips TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.medicine_information TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.health_questions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.health_chat_history TO anon, authenticated, service_role;
