-- Update search_locations RPC function to use weighted pg_trgm similarity and word_similarity matching
CREATE OR REPLACE FUNCTION public.search_locations(search_text text)
RETURNS jsonb AS $$
DECLARE
    res jsonb;
BEGIN
    SELECT jsonb_agg(r) INTO res FROM (
        SELECT 
            s.location_id,
            s.location_name,
            s.alternate_name,
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
            -- Compute advanced weighted score (each column independently)
            (
                -- Location Name (Weight 100)
                ((COALESCE(similarity(s.location_name, search_text), 0) * 60 + COALESCE(word_similarity(s.location_name, search_text), 0) * 40)) +
                (CASE WHEN lower(s.location_name) = lower(search_text) THEN 200 WHEN lower(s.location_name) LIKE lower(search_text) || '%' THEN 150 ELSE 0 END)
            ) +
            (
                -- Alternate Name (Weight 90)
                (((COALESCE(similarity(s.alternate_name, search_text), 0) * 60 + COALESCE(word_similarity(s.alternate_name, search_text), 0) * 40) * 0.9)) +
                (CASE WHEN lower(s.alternate_name) = lower(search_text) THEN 180 WHEN lower(s.alternate_name) LIKE lower(search_text) || '%' THEN 135 ELSE 0 END)
            ) +
            (
                -- Village (Weight 80)
                (((COALESCE(similarity(s.village, search_text), 0) * 60 + COALESCE(word_similarity(s.village, search_text), 0) * 40) * 0.8)) +
                (CASE WHEN lower(s.village) = lower(search_text) THEN 160 WHEN lower(s.village) LIKE lower(search_text) || '%' THEN 120 ELSE 0 END)
            ) +
            (
                -- Town (Weight 75)
                (((COALESCE(similarity(s.town, search_text), 0) * 60 + COALESCE(word_similarity(s.town, search_text), 0) * 40) * 0.75)) +
                (CASE WHEN lower(s.town) = lower(search_text) THEN 150 WHEN lower(s.town) LIKE lower(search_text) || '%' THEN 112 ELSE 0 END)
            ) +
            (
                -- City (Weight 70)
                (((COALESCE(similarity(s.city, search_text), 0) * 60 + COALESCE(word_similarity(s.city, search_text), 0) * 40) * 0.7)) +
                (CASE WHEN lower(s.city) = lower(search_text) THEN 140 WHEN lower(s.city) LIKE lower(search_text) || '%' THEN 105 ELSE 0 END)
            ) +
            (
                -- Mandal (Weight 60)
                (((COALESCE(similarity(s.mandal, search_text), 0) * 60 + COALESCE(word_similarity(s.mandal, search_text), 0) * 40) * 0.6)) +
                (CASE WHEN lower(s.mandal) = lower(search_text) THEN 120 WHEN lower(s.mandal) LIKE lower(search_text) || '%' THEN 90 ELSE 0 END)
            ) +
            (
                -- District (Weight 50)
                (((COALESCE(similarity(s.district, search_text), 0) * 60 + COALESCE(word_similarity(s.district, search_text), 0) * 40) * 0.5)) +
                (CASE WHEN lower(s.district) = lower(search_text) THEN 100 WHEN lower(s.district) LIKE lower(search_text) || '%' THEN 75 ELSE 0 END)
            ) +
            (
                -- State (Weight 40)
                (((COALESCE(similarity(s.state, search_text), 0) * 60 + COALESCE(word_similarity(s.state, search_text), 0) * 40) * 0.4)) +
                (CASE WHEN lower(s.state) = lower(search_text) THEN 80 WHEN lower(s.state) LIKE lower(search_text) || '%' THEN 60 ELSE 0 END)
            ) AS total_score
        FROM public.location_search s
        WHERE 
            s.location_name % search_text
            OR s.alternate_name % search_text
            OR s.village % search_text
            OR s.town % search_text
            OR s.city % search_text
            OR s.mandal % search_text
            OR s.district % search_text
            OR s.location_name ILIKE '%' || search_text || '%'
            OR s.alternate_name ILIKE '%' || search_text || '%'
            OR s.village ILIKE '%' || search_text || '%'
            OR s.town ILIKE '%' || search_text || '%'
            OR s.city ILIKE '%' || search_text || '%'
            OR s.mandal ILIKE '%' || search_text || '%'
            OR s.district ILIKE '%' || search_text || '%'
        ORDER BY total_score DESC, s.population DESC
        LIMIT 8
    ) r;

    RETURN COALESCE(res, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
