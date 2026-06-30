-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name TEXT NOT NULL,
    village TEXT,
    mandal TEXT,
    district TEXT,
    state TEXT,
    country TEXT,
    pin_code TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone TEXT NOT NULL,
    search_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indices
-- GIN index on location_name for lightning-fast fuzzy matching
CREATE INDEX IF NOT EXISTS locations_location_name_trgm_idx ON public.locations USING gin (location_name gin_trgm_ops);
-- B-Tree index on pin_code
CREATE INDEX IF NOT EXISTS locations_pin_code_idx ON public.locations (pin_code);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read locations (public read)
CREATE POLICY "Allow public read access to locations"
ON public.locations
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert locations (public cache write)
CREATE POLICY "Allow public insert access to locations"
ON public.locations
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update locations (to increment search_count / last_used)
CREATE POLICY "Allow public update access to locations"
ON public.locations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
