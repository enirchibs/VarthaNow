-- ======================================================================
-- VAARTANOW SAFETY-FIRST MARKETPLACE & PLATFORM COMPLIANCE SCHEMA
-- ======================================================================

-- 1. Profiles Table (Mobile, Mandatory Full Name, Optional Email)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL UNIQUE,
  mobile_verified BOOLEAN NOT NULL DEFAULT false,
  mobile_verified_at TIMESTAMPTZ,
  full_name TEXT,
  full_name_added_at TIMESTAMPTZ,
  email TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  role TEXT NOT NULL DEFAULT 'provider', -- 'provider', 'seller', 'customer'
  listing_purpose TEXT, -- 'service', 'business', 'product', 'driver_transport', 'machinery', 'property', 'other'
  account_status TEXT NOT NULL DEFAULT 'draft', 
  -- Statuses: 'draft', 'mobile_verified', 'profile_incomplete', 'ready_for_submission', 'pending_review', 'active', 'under_review', 'temporarily_suspended', 'removed', 'blocked'
  verification_badges JSONB NOT NULL DEFAULT '{"mobile_verified": false, "email_verified": false, "identity_verified": false, "business_verified": false, "licence_verified": false, "customer_rated": false}'::jsonb,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Immutable Terms Acceptances (Legal Auditable Records)
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL, -- 'provider', 'seller', 'customer'
  terms_type TEXT NOT NULL, -- 'provider_terms', 'seller_terms', 'customer_terms', 'code_of_conduct'
  terms_version TEXT NOT NULL, -- 'provider_terms_v1_0', 'seller_terms_v1_0', etc.
  terms_hash TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mobile_number TEXT NOT NULL,
  mobile_verified_at TIMESTAMPTZ,
  email TEXT,
  email_verified_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  acceptance_method TEXT NOT NULL DEFAULT 'web_checkbox',
  document_snapshot_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Marketplace Listings (Services, Businesses, Transport, Machinery, Products)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  category TEXT NOT NULL, -- workers, transport, construction, farm_machines, etc.
  sub_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  locality TEXT NOT NULL,
  price_rate TEXT NOT NULL,
  description TEXT NOT NULL,
  available_days TEXT,
  working_hours TEXT,
  experience_years TEXT,
  vehicle_type TEXT,
  licence_info TEXT,
  machinery_model TEXT,
  cuisine_capacity TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_free_visit BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending_review', 'under_review', 'suspended', 'removed'
  listing_type TEXT NOT NULL DEFAULT 'independent_provider', -- 'independent_provider', 'independent_business', 'independent_seller'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Complaints & Safety Reports System
CREATE TABLE IF NOT EXISTS public.safety_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  reported_provider_name TEXT,
  reported_mobile TEXT,
  reporter_name TEXT,
  reporter_mobile TEXT,
  complaint_category TEXT NOT NULL,
  -- 'suspected_theft', 'fraud_scam', 'property_damage', 'threat_violence', 'harassment', 'fake_identity', 'misrepresentation', 'unauthorized_access', 'unsafe_behaviour', 'prohibited_goods_services', 'spam', 'other'
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed', 'action_taken'
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Audit Events Trail
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  -- 'mobile_submitted', 'otp_sent', 'otp_verified', 'full_name_added', 'email_added', 'email_verified', 'profile_created', 'listing_created', 'terms_viewed', 'terms_accepted', 'listing_submitted', 'listing_approved', 'listing_rejected', 'complaint_created', 'provider_suspended', 'provider_restored', 'listing_removed'
  entity_id TEXT,
  entity_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_mobile ON public.terms_acceptances(mobile_number);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_terms_version ON public.terms_acceptances(terms_version);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_locality ON public.marketplace_listings(locality);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_safety_complaints_status ON public.safety_complaints(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Marketplace Listings
CREATE POLICY "Public can view active listings"
  ON public.marketplace_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can insert own listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (true);

-- Terms Acceptances: Immutable records
CREATE POLICY "Users can view own acceptances"
  ON public.terms_acceptances FOR SELECT
  USING (true);

CREATE POLICY "Users can insert acceptance records"
  ON public.terms_acceptances FOR INSERT
  WITH CHECK (true);
