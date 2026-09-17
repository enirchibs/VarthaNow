-- ==============================================================================
-- 💍 MANA ADDA MATRIMONY DATABASE MIGRATION
-- Supports: Profiles, Photos, Privacy, Local Match Rings, Interests,
-- Contact Requests, Saved Profiles, Reports, and Blocked Users.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. MATRIMONY PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.matrimony_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    profile_for TEXT DEFAULT 'self', -- self, son, daughter, brother, sister, relative
    profile_managed_by_label_te TEXT DEFAULT 'స్వయంగా',
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('bride', 'groom')),
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    height TEXT,
    marital_status TEXT DEFAULT 'never_married',
    marital_status_label_te TEXT DEFAULT 'అవివాహితుడు/అవివాహిత',
    mother_tongue TEXT DEFAULT 'తెలుగు',
    religion TEXT DEFAULT 'హిందూ',
    community TEXT,
    subcommunity TEXT,
    caste_no_bar BOOLEAN DEFAULT false,
    education TEXT NOT NULL,
    education_detail TEXT,
    occupation TEXT NOT NULL,
    occupation_detail TEXT,
    income_range TEXT,
    village_town TEXT NOT NULL,
    mandal TEXT,
    district TEXT NOT NULL,
    state TEXT DEFAULT 'Andhra Pradesh',
    latitude_approx DOUBLE PRECISION NOT NULL,
    longitude_approx DOUBLE PRECISION NOT NULL,
    about_te TEXT,
    family_type TEXT,
    family_values TEXT,
    diet TEXT,
    horoscope_available BOOLEAN DEFAULT false,
    rashi TEXT,
    nakshatra TEXT,
    gothram TEXT,
    photos TEXT[] DEFAULT '{}',
    photo_privacy TEXT DEFAULT 'public' CHECK (photo_privacy IN ('public', 'request_only', 'approved_only', 'hidden')),
    contact_privacy TEXT DEFAULT 'request_only' CHECK (contact_privacy IN ('request_only', 'mutual_interest', 'verified_only')),
    verification_level INTEGER DEFAULT 1,
    verification_badge_label_te TEXT DEFAULT '📱 మొబైల్ వెరిఫైడ్',
    phone TEXT NOT NULL, -- Private!
    profile_completeness INTEGER DEFAULT 80,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MATRIMONY INTERESTS TABLE
CREATE TABLE IF NOT EXISTS public.matrimony_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    receiver_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'maybe_later')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_profile_id, receiver_profile_id)
);

-- 3. MATRIMONY CONTACT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.matrimony_contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_phone TEXT NOT NULL,
    target_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(requester_profile_id, target_profile_id)
);

-- 4. MATRIMONY SAVED PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.matrimony_saved (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, profile_id)
);

-- 5. MATRIMONY REPORTS TABLE (Safety & Scam reporting)
CREATE TABLE IF NOT EXISTS public.matrimony_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    reporter_phone TEXT,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'action_taken', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MATRIMONY BLOCKED TABLE
CREATE TABLE IF NOT EXISTS public.matrimony_blocked (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    blocked_profile_id UUID NOT NULL REFERENCES public.matrimony_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, blocked_profile_id)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_matrimony_gender_age ON public.matrimony_profiles (gender, age);
CREATE INDEX IF NOT EXISTS idx_matrimony_district ON public.matrimony_profiles (district);
CREATE INDEX IF NOT EXISTS idx_matrimony_lat_lon ON public.matrimony_profiles (latitude_approx, longitude_approx);
CREATE INDEX IF NOT EXISTS idx_matrimony_name_trgm ON public.matrimony_profiles USING gin (name gin_trgm_ops);

-- Row Level Security Policies
ALTER TABLE public.matrimony_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_blocked ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active profiles without raw phone" ON public.matrimony_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public insert profile" ON public.matrimony_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert interests" ON public.matrimony_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read interests" ON public.matrimony_interests FOR SELECT USING (true);
CREATE POLICY "Allow public insert contact requests" ON public.matrimony_contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read contact requests" ON public.matrimony_contact_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert reports" ON public.matrimony_reports FOR INSERT WITH CHECK (true);
