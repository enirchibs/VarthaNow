-- Update search_locations RPC function to ignore PIN codes and optimize for location text priority
CREATE OR REPLACE FUNCTION public.search_locations(search_text text)
RETURNS jsonb AS $$
DECLARE
    res jsonb;
BEGIN
    -- Text-based search incorporating matching priorities (completely ignoring PIN codes)
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
            -- Scoring matching priority: lower number indicates higher match priority
            LEAST(
                CASE 
                    WHEN lower(s.location_name) = lower(search_text) THEN 1
                    WHEN lower(s.location_name) LIKE lower(search_text) || '%' THEN 2
                    WHEN lower(s.alternate_name) = lower(search_text) THEN 3
                    WHEN lower(s.alternate_name) LIKE lower(search_text) || '%' THEN 3
                    WHEN lower(s.village) = lower(search_text) THEN 4
                    WHEN lower(s.town) = lower(search_text) THEN 5
                    WHEN lower(s.city) = lower(search_text) THEN 6
                    WHEN lower(s.mandal) = lower(search_text) THEN 7
                    WHEN lower(s.district) = lower(search_text) THEN 8
                    WHEN lower(s.state) = lower(search_text) THEN 9
                    ELSE 10
                END,
                -- Check if an alias matches this query exactly
                COALESCE(
                    (SELECT 3 FROM public.location_aliases a 
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

    RETURN COALESCE(res, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
