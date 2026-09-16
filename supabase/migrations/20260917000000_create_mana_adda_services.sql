-- ==============================================================================
-- 🛠️ MANA ADDA SERVICES & RENTALS DATABASE MIGRATION
-- Supports: 15 Broad Categories, Subcategories, Local Providers, Distance Radius,
-- Disclaimers, Verification, Photos, Reviews, and Safety Reports.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS public.service_categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name_te TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    color_bg TEXT NOT NULL,
    color_text TEXT NOT NULL,
    color_border TEXT,
    image_url TEXT,
    is_rental BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SERVICE SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.service_subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name_te TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    image_url TEXT,
    description_te TEXT,
    is_rental BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SERVICE PROVIDERS
CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    business_name TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    phone_verified BOOLEAN DEFAULT true,
    category_id TEXT NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT NOT NULL REFERENCES public.service_subcategories(id) ON DELETE RESTRICT,
    avatar_url TEXT,
    photos TEXT[] DEFAULT '{}',
    locality TEXT NOT NULL,
    village_town TEXT NOT NULL,
    mandal TEXT,
    district TEXT NOT NULL,
    state TEXT DEFAULT 'Andhra Pradesh',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    service_radius_km INTEGER DEFAULT 25,
    service_mode TEXT DEFAULT 'both' CHECK (service_mode IN ('customer_location', 'provider_location', 'both')),
    price_type TEXT DEFAULT 'starting_from' CHECK (price_type IN ('fixed', 'starting_from', 'quote', 'hourly', 'daily', 'negotiable')),
    price_from NUMERIC,
    price_rate_label TEXT,
    pricing_breakdown JSONB DEFAULT '[]'::jsonb,
    services_offered TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 3,
    rating NUMERIC(3, 1) DEFAULT 4.8,
    review_count INTEGER DEFAULT 1,
    description_te TEXT NOT NULL,
    description_en TEXT,
    working_hours TEXT DEFAULT 'ఉదయం 8:00 - రాత్రి 8:00 (ప్రతిరోజూ)',
    is_available_now BOOLEAN DEFAULT true,
    is_sponsored BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SERVICE REVIEWS
CREATE TABLE IF NOT EXISTS public.service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SERVICE REPORTS (Safety / Abuse Reporting)
CREATE TABLE IF NOT EXISTS public.service_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    reporter_phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for rapid search and lookup
CREATE INDEX IF NOT EXISTS idx_service_providers_cat_sub ON public.service_providers (category_id, subcategory_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_district ON public.service_providers (district);
CREATE INDEX IF NOT EXISTS idx_service_providers_lat_lon ON public.service_providers (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_service_providers_name_trgm ON public.service_providers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_service_providers_biz_trgm ON public.service_providers USING gin (business_name gin_trgm_ops);

-- RLS Policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to service_categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_subcategories" ON public.service_subcategories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_providers" ON public.service_providers FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow public insert to service_providers" ON public.service_providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to service_reviews" ON public.service_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert to service_reviews" ON public.service_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to service_reports" ON public.service_reports FOR INSERT WITH CHECK (true);

-- Geospatial distance calculation using Haversine Formula (returns km)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    r CONSTANT DOUBLE PRECISION := 6371.0; -- Earth radius in km
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
