-- 1. Enable the pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================
-- TABLES
-- =========================================================

-- Table 1: Official India Post PIN Data
CREATE TABLE IF NOT EXISTS public.india_post_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pincode TEXT NOT NULL,
    office_name TEXT NOT NULL,
    delivery_status TEXT,
    division TEXT,
    region TEXT,
    circle TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    country TEXT DEFAULT 'India',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    source TEXT DEFAULT 'India Post',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 2: GeoNames India Locations
CREATE TABLE IF NOT EXISTS public.geonames_locations (
    geoname_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    ascii_name TEXT,
    alternate_names TEXT,
    feature_class TEXT,
    feature_code TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation INTEGER,
    population BIGINT DEFAULT 0,
    admin1 TEXT, -- State code or name
    admin2 TEXT, -- District
    admin3 TEXT, -- Sub-district / Tehsil
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 3: OpenStreetMap places
CREATE TABLE IF NOT EXISTS public.osm_locations (
    osm_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    place_type TEXT, -- city, town, village, suburb, etc.
    suburb TEXT,
    village TEXT,
    town TEXT,
    city TEXT,
    mandal TEXT,
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    source TEXT DEFAULT 'OpenStreetMap',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 4: Alternative spellings and translations
CREATE TABLE IF NOT EXISTS public.location_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name TEXT NOT NULL,
    alias TEXT NOT NULL,
    language TEXT, -- te, hi, en, etc.
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 5: Google Geocoding Cache
CREATE TABLE IF NOT EXISTS public.google_location_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT UNIQUE NOT NULL,
    formatted_address TEXT NOT NULL,
    google_place_id TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone TEXT NOT NULL,
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================
-- MATERIALIZED VIEW
-- =========================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.location_search AS
-- 1. India Post Locations
SELECT
    'pincode_' || id::text AS location_id,
    office_name AS location_name,
    NULL::text AS alternate_name,
    pincode,
    office_name AS village,
    NULL::text AS town,
    NULL::text AS city,
    NULL::text AS mandal,
    district,
    state,
    country,
    latitude,
    longitude,
    timezone,
    0::bigint AS population,
    source,
    1 AS search_rank
FROM public.india_post_locations

UNION ALL

-- 2. GeoNames Locations
SELECT
    'geonames_' || geoname_id::text AS location_id,
    name AS location_name,
    alternate_names AS alternate_name,
    NULL::text AS pincode,
    NULL::text AS village,
    NULL::text AS town,
    name AS city,
    NULL::text AS mandal,
    district,
    state,
    country,
    latitude,
    longitude,
    timezone,
    population,
    'GeoNames'::text AS source,
    2 AS search_rank
FROM public.geonames_locations

UNION ALL

-- 3. OSM Locations
SELECT
    'osm_' || osm_id::text AS location_id,
    name AS location_name,
    NULL::text AS alternate_name,
    NULL::text AS pincode,
    village,
    town,
    city,
    mandal,
    district,
    state,
    country,
    latitude,
    longitude,
    timezone,
    0::bigint AS population,
    source,
    3 AS search_rank
FROM public.osm_locations

UNION ALL

-- 4. Google Location Cache
SELECT
    'google_' || id::text AS location_id,
    formatted_address AS location_name,
    query AS alternate_name,
    NULL::text AS pincode,
    NULL::text AS village,
    NULL::text AS town,
    NULL::text AS city,
    NULL::text AS mandal,
    district,
    state,
    country,
    latitude,
    longitude,
    timezone,
    0::bigint AS population,
    'Google Cache'::text AS source,
    5 AS search_rank
FROM public.google_location_cache;

-- =========================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- =========================================================

-- Unique Index on Materialized View required for CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS location_search_id_idx ON public.location_search (location_id);

-- GIN Trigram index for fuzzy searching on location_name and alternate_name
CREATE INDEX IF NOT EXISTS location_search_name_trgm_idx ON public.location_search USING gin (location_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS location_search_alt_trgm_idx ON public.location_search USING gin (alternate_name gin_trgm_ops);

-- B-Tree indices for exact lookups
CREATE INDEX IF NOT EXISTS location_search_pincode_idx ON public.location_search (pincode);
CREATE INDEX IF NOT EXISTS location_search_district_idx ON public.location_search (district);
CREATE INDEX IF NOT EXISTS location_search_state_idx ON public.location_search (state);
CREATE INDEX IF NOT EXISTS location_search_lat_lng_idx ON public.location_search (latitude, longitude);

-- Enable RLS for tables
ALTER TABLE public.india_post_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geonames_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osm_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_location_cache ENABLE ROW LEVEL SECURITY;

-- Add RLS public policies
CREATE POLICY "Allow public read access to india_post" ON public.india_post_locations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to geonames" ON public.geonames_locations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to osm" ON public.osm_locations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to aliases" ON public.location_aliases FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to google_cache" ON public.google_location_cache FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to google_cache" ON public.google_location_cache FOR INSERT TO public WITH CHECK (true);

-- =========================================================
-- FUNCTIONS / RPCS
-- =========================================================

-- 1. Refresh materialized view function
CREATE OR REPLACE FUNCTION public.refresh_location_search()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.location_search;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Master Search Function
CREATE OR REPLACE FUNCTION public.search_locations(search_text text)
RETURNS jsonb AS $$
DECLARE
    is_numeric boolean;
    res jsonb;
BEGIN
    is_numeric := search_text ~ '^[0-9]+$';
    
    IF is_numeric THEN
        -- Rank exact PIN code matching
        SELECT jsonb_agg(r) INTO res FROM (
            SELECT 
                location_id,
                location_name,
                alternate_name,
                pincode,
                village,
                town,
                city,
                mandal,
                district,
                state,
                country,
                latitude,
                longitude,
                timezone,
                population,
                source
            FROM public.location_search
            WHERE pincode = search_text
            ORDER BY search_rank ASC, population DESC
            LIMIT 10
        ) r;
    ELSE
        -- Text-based search incorporating matching priorities
        SELECT jsonb_agg(r) INTO res FROM (
            SELECT 
                s.location_id,
                s.location_name,
                s.alternate_name,
                s.pincode,
                s.village,
                s.town,
                s.city,
                s.mandal,
                s.district,
                s.state,
                s.country,
                s.latitude,
                s.longitude,
                s.timezone,
                s.population,
                s.source,
                -- Scoring matching priority: lower number indicates higher match priority
                LEAST(
                    CASE 
                        WHEN lower(s.location_name) = lower(search_text) THEN 1
                        WHEN lower(s.alternate_name) = lower(search_text) THEN 2
                        WHEN lower(s.location_name) LIKE lower(search_text) || '%' THEN 3
                        WHEN lower(s.alternate_name) LIKE lower(search_text) || '%' THEN 4
                        WHEN lower(s.village) = lower(search_text) THEN 5
                        WHEN lower(s.town) = lower(search_text) THEN 6
                        WHEN lower(s.city) = lower(search_text) THEN 7
                        WHEN lower(s.mandal) = lower(search_text) THEN 8
                        WHEN lower(s.district) = lower(search_text) THEN 9
                        WHEN lower(s.state) = lower(search_text) THEN 10
                        ELSE 11
                    END,
                    -- Check if an alias matches this query exactly
                    COALESCE(
                        (SELECT 12 FROM public.location_aliases a 
                         WHERE lower(a.location_name) = lower(s.location_name) 
                           AND lower(a.alias) = lower(search_text) 
                         LIMIT 1), 
                        99
                    )
                ) AS match_priority
            FROM public.location_search s
            WHERE 
                s.location_name ILIKE '%' || search_text || '%'
                OR s.alternate_name ILIKE '%' || search_text || '%'
                OR s.village ILIKE '%' || search_text || '%'
                OR s.town ILIKE '%' || search_text || '%'
                OR s.city ILIKE '%' || search_text || '%'
                OR s.mandal ILIKE '%' || search_text || '%'
                OR s.district ILIKE '%' || search_text || '%'
                OR EXISTS (
                    SELECT 1 FROM public.location_aliases a 
                    WHERE lower(a.location_name) = lower(s.location_name) 
                      AND a.alias ILIKE '%' || search_text || '%'
                )
            ORDER BY match_priority ASC, s.search_rank ASC, s.population DESC
            LIMIT 10
        ) r;
    END IF;

    RETURN COALESCE(res, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- CSV IMPORT COPY SCRIPTS EXAMPLES
-- =========================================================
-- COPY public.india_post_locations (pincode, office_name, delivery_status, division, region, circle, district, state, latitude, longitude, country, timezone, source)
-- FROM '/csv/india_post_pincode.csv' DELIMITER ',' CSV HEADER;
-- 
-- COPY public.geonames_locations (geoname_id, name, ascii_name, alternate_names, feature_class, feature_code, latitude, longitude, elevation, population, admin1, admin2, admin3, district, state, country, timezone)
-- FROM '/csv/geonames_india.csv' DELIMITER ',' CSV HEADER;
-- 
-- COPY public.osm_locations (osm_id, name, place_type, suburb, village, town, city, mandal, district, state, country, latitude, longitude, timezone, source)
-- FROM '/csv/osm_places.csv' DELIMITER ',' CSV HEADER;
-- 
-- COPY public.location_aliases (location_name, alias, language, source)
-- FROM '/csv/osm_aliases.csv' DELIMITER ',' CSV HEADER;
