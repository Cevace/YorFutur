-- =====================================================
-- Live CV Infrastructure Migration
-- =====================================================
-- Creates tables, RLS policies, and indexes for the Live CV feature
-- Allows users to share their CV via public links with analytics

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Table: live_cv_links
-- Stores shareable CV links with unique slugs
CREATE TABLE IF NOT EXISTS public.live_cv_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: cv_analytics
-- Tracks detailed analytics for each CV view
CREATE TABLE IF NOT EXISTS public.cv_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES public.live_cv_links(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT now(),
    user_agent TEXT,
    country TEXT,
    referer TEXT
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Index for fast slug lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_live_cv_links_slug ON public.live_cv_links(slug);

-- Index for user's links
CREATE INDEX IF NOT EXISTS idx_live_cv_links_user_id ON public.live_cv_links(user_id);

-- Index for active links only
CREATE INDEX IF NOT EXISTS idx_live_cv_links_active ON public.live_cv_links(is_active) WHERE is_active = true;

-- Index for analytics by link
CREATE INDEX IF NOT EXISTS idx_cv_analytics_link_id ON public.cv_analytics(link_id);

-- Index for analytics time-based queries
CREATE INDEX IF NOT EXISTS idx_cv_analytics_viewed_at ON public.cv_analytics(viewed_at DESC);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.live_cv_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES - live_cv_links
-- =====================================================

-- Policy: Users can view their own links
CREATE POLICY "Users can view own links"
ON public.live_cv_links
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can create their own links
CREATE POLICY "Users can create own links"
ON public.live_cv_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update own links"
ON public.live_cv_links
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete own links"
ON public.live_cv_links
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Anonymous users can SELECT active links (for slug lookup only)
CREATE POLICY "Anonymous can view active links"
ON public.live_cv_links
FOR SELECT
TO anon
USING (is_active = true);

-- =====================================================
-- 5. RLS POLICIES - cv_analytics
-- =====================================================

-- Policy: Users can view analytics for their own links
CREATE POLICY "Users can view own analytics"
ON public.cv_analytics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.live_cv_links
        WHERE live_cv_links.id = cv_analytics.link_id
        AND live_cv_links.user_id = auth.uid()
    )
);

-- Policy: Service role can insert analytics (via server action)
CREATE POLICY "Service can insert analytics"
ON public.cv_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- 6. PUBLIC ACCESS TO PROFILE DATA (CRITICAL SECURITY)
-- =====================================================

-- Drop existing public policies if they exist
DROP POLICY IF EXISTS "Public can view profiles with active live link" ON public.profiles;
DROP POLICY IF EXISTS "Public can view experiences with active live link" ON public.profile_experiences;
DROP POLICY IF EXISTS "Public can view education with active live link" ON public.profile_educations;
DROP POLICY IF EXISTS "Public can view languages with active live link" ON public.profile_languages;

-- Policy: Anonymous can view profiles ONLY if user has an active live link
CREATE POLICY "Public can view profiles with active live link"
ON public.profiles
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.live_cv_links
        WHERE live_cv_links.user_id = profiles.id
        AND live_cv_links.is_active = true
    )
);

-- Policy: Anonymous can view experiences ONLY if user has an active live link
CREATE POLICY "Public can view experiences with active live link"
ON public.profile_experiences
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.live_cv_links
        WHERE live_cv_links.user_id = profile_experiences.user_id
        AND live_cv_links.is_active = true
    )
);

-- Policy: Anonymous can view education ONLY if user has an active live link
CREATE POLICY "Public can view education with active live link"
ON public.profile_educations
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.live_cv_links
        WHERE live_cv_links.user_id = profile_educations.user_id
        AND live_cv_links.is_active = true
    )
);

-- Policy: Anonymous can view languages ONLY if user has an active live link
CREATE POLICY "Public can view languages with active live link"
ON public.profile_languages
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.live_cv_links
        WHERE live_cv_links.user_id = profile_languages.user_id
        AND live_cv_links.is_active = true
    )
);

-- =====================================================
-- 7. HELPER FUNCTION - Generate Unique Slug
-- =====================================================

CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    random_suffix TEXT;
    proposed_slug TEXT;
    slug_exists BOOLEAN;
BEGIN
    -- Generate slug with random suffix
    LOOP
        -- Create random 4-character suffix (alphanumeric)
        random_suffix := lower(substring(md5(random()::text) from 1 for 4));
        
        -- Create slug: lowercase name + random suffix
        proposed_slug := lower(regexp_replace(base_name, '[^a-z0-9]+', '-', 'g')) || '-' || random_suffix;
        
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
-- 8. UPDATE TRIGGER for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_cv_links_updated_at
BEFORE UPDATE ON public.live_cv_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('live_cv_links', 'cv_analytics');

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('live_cv_links', 'cv_analytics');

-- Verify policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('live_cv_links', 'cv_analytics', 'profiles', 'profile_experiences', 'profile_educations', 'profile_languages')
ORDER BY tablename, policyname;
