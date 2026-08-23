-- ============================================================================
-- Migration: VaartaNow Hyperlocal Classifieds & Verified Contacts
-- ============================================================================

-- 1. Classifieds Table
CREATE TABLE IF NOT EXISTS public.classifieds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electronics','furniture','vehicles','property','services','jobs','other')),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  locality TEXT NOT NULL,
  contact TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available','sold')),
  offer_discount TEXT,
  free_items TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Verified Contacts & Seller Profiles Table
CREATE TABLE IF NOT EXISTS public.verified_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active classifieds" ON public.classifieds;
CREATE POLICY "Public read active classifieds" ON public.classifieds FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public insert classifieds" ON public.classifieds;
CREATE POLICY "Public insert classifieds" ON public.classifieds FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update classifieds" ON public.classifieds;
CREATE POLICY "Public update classifieds" ON public.classifieds FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete classifieds" ON public.classifieds;
CREATE POLICY "Public delete classifieds" ON public.classifieds FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read verified_contacts" ON public.verified_contacts;
CREATE POLICY "Public read verified_contacts" ON public.verified_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert verified_contacts" ON public.verified_contacts;
CREATE POLICY "Public insert verified_contacts" ON public.verified_contacts FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.classifieds TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verified_contacts TO anon, authenticated, service_role;
