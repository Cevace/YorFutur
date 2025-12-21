-- =====================================================
-- IMPROVED SLUG GENERATOR - Privacy Enhanced
-- =====================================================
-- Skips first 2 characters of EACH name part (firstname, lastname)
-- Example: "Peter Wienecke" → "ter-enecke-a3f2"

CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    random_suffix TEXT;
    proposed_slug TEXT;
    slug_exists BOOLEAN;
    name_parts TEXT[];
    cleaned_part TEXT;
    result_parts TEXT[] := ARRAY[]::TEXT[];
    i INTEGER;
BEGIN
    -- Split name by spaces
    name_parts := regexp_split_to_array(base_name, '\s+');
    
    -- Process each name part (firstname, lastname, etc.)
    FOR i IN 1..array_length(name_parts, 1) LOOP
        -- Clean the part: remove non-alphanumeric and lowercase
        cleaned_part := lower(regexp_replace(name_parts[i], '[^a-zA-Z0-9]+', '', 'g'));
        
        -- Skip first 2 characters for privacy
        IF length(cleaned_part) > 2 THEN
            cleaned_part := substring(cleaned_part from 3);
        ELSIF length(cleaned_part) > 0 THEN
            -- If only 1-2 chars, skip it entirely for privacy
            CONTINUE;
        ELSE
            -- Empty part, skip it
            CONTINUE;
        END IF;
        
        -- Add to result
        result_parts := array_append(result_parts, cleaned_part);
    END LOOP;
    
    -- If no valid parts, use "user"
    IF array_length(result_parts, 1) IS NULL THEN
        result_parts := ARRAY['user'];
    END IF;
    
    -- Generate slug with random suffix
    LOOP
        -- Create random 4-character suffix
        random_suffix := lower(substring(md5(random()::text) from 1 for 4));
        
        -- Join parts with hyphen and add suffix
        proposed_slug := array_to_string(result_parts, '-') || '-' || random_suffix;
        
        -- Check if slug exists
        SELECT EXISTS(SELECT 1 FROM public.live_cv_links WHERE slug = proposed_slug) INTO slug_exists;
        
        -- If unique, return it
        IF NOT slug_exists THEN
            RETURN proposed_slug;
        END IF;
    END LOOP;
END;
$$;

-- =====================================================
-- EXAMPLES OF GENERATED SLUGS
-- =====================================================
-- "Peter Wienecke"     → "ter-enecke-a3f2"
-- "John Doe"           → "hn-e-b5c8"
-- "Maria García López" → "ria-rcia-pez-d7f9"
-- "A B"                → "user-e4a1" (names too short)
