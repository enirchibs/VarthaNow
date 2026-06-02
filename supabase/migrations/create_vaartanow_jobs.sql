-- ====================================================
-- SUPABASE MIGRATION: CREATE VAARTANOW JOBS TABLE
-- ====================================================

-- 1. Create custom ENUM types conditionally (checking pg_type to prevent 'already exists' errors)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_level_type') THEN
        CREATE TYPE experience_level_type AS ENUM ('Fresher', 'Experienced', 'Any');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_mode_type') THEN
        CREATE TYPE work_mode_type AS ENUM ('On-site', 'Remote', 'Hybrid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_type') THEN
        CREATE TYPE contract_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship');
    END IF;
END$$;

-- 2. Create the main vaartanow_jobs table
CREATE TABLE IF NOT EXISTS vaartanow_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT,
    state TEXT,
    description_snippet TEXT NOT NULL,
    full_description TEXT NOT NULL,
    apply_link TEXT UNIQUE NOT NULL,
    source_platform TEXT NOT NULL,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    salary_range TEXT,
    skills TEXT[] DEFAULT '{}'::TEXT[],
    tags TEXT[] DEFAULT '{}'::TEXT[],
    logo_url TEXT,
    experience_level experience_level_type DEFAULT 'Any'::experience_level_type,
    work_mode work_mode_type DEFAULT 'On-site'::work_mode_type,
    contract_type contract_type DEFAULT 'Full-time'::contract_type,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    search_vector tsvector, -- Defined as a standard column to avoid "generation expression is not immutable" errors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Ensure search_vector column exists on the table (if table was created previously without it)
ALTER TABLE vaartanow_jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 4. Create optimized indexes
-- GIN index on search vector for instant full-text search queries
CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON vaartanow_jobs USING gin(search_vector);

-- GIN indexes on skills and tags arrays for tag-matching queries
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON vaartanow_jobs USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON vaartanow_jobs USING gin(tags);

-- Standard B-Tree indexes on commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON vaartanow_jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON vaartanow_jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON vaartanow_jobs(contract_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON vaartanow_jobs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_district ON vaartanow_jobs(district);

-- 5. Automate updated_at and search_vector trigger function
-- Calculating the search_vector inside a BEFORE INSERT OR UPDATE trigger completely avoids 
-- any PostgreSQL function immutability limitations (like array_to_string).
CREATE OR REPLACE FUNCTION update_vaartanow_jobs_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Automate modification date update
    NEW.updated_at = timezone('utc'::text, now());
    
    -- 2. Dynamically calculate the full-text search vector
    NEW.search_vector = to_tsvector('english', 
        coalesce(NEW.title, '') || ' ' || 
        coalesce(NEW.company_name, '') || ' ' || 
        coalesce(NEW.description_snippet, '') || ' ' || 
        coalesce(array_to_string(NEW.skills, ' '), '')
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop any old trigger variants to prevent overlap
DROP TRIGGER IF EXISTS update_vaartanow_jobs_updated_at ON vaartanow_jobs;
DROP TRIGGER IF EXISTS update_vaartanow_jobs_trigger ON vaartanow_jobs;

-- Bind the trigger to BEFORE INSERT OR UPDATE to automate all writes
CREATE TRIGGER update_vaartanow_jobs_trigger
    BEFORE INSERT OR UPDATE ON vaartanow_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_vaartanow_jobs_trigger_function();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE vaartanow_jobs ENABLE ROW LEVEL SECURITY;

-- Public Policy: Allow read access to approved and active jobs
DROP POLICY IF EXISTS "Allow public read access" ON vaartanow_jobs;
CREATE POLICY "Allow public read access" ON vaartanow_jobs
    FOR SELECT
    USING (is_active = true AND is_approved = true);

-- Authenticated Admin Policy: Allow full modifications
DROP POLICY IF EXISTS "Allow admin full access" ON vaartanow_jobs;
CREATE POLICY "Allow admin full access" ON vaartanow_jobs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. Grant explicit permissions to PostgREST/Data API roles (Required for projects created after May 30, 2026)
GRANT SELECT ON TABLE public.vaartanow_jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vaartanow_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vaartanow_jobs TO service_role;
