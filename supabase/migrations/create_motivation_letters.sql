-- =====================================================
-- Motivation Letters Infrastructure Migration
-- =====================================================
-- Creates tables and RLS policies for AI-generated motivation letters

-- =====================================================
-- 1. CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.motivation_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Source data
    vacancy_id UUID, -- Optional: for future vacancy tracking
    vacancy_text TEXT NOT NULL,
    cv_data JSONB NOT NULL,
    
    -- AI Generated variants (stored as JSONB for flexibility)
    strategic_variant JSONB,
    culture_variant JSONB,
    storyteller_variant JSONB,
    
    -- User selection & edits
    selected_variant TEXT CHECK (selected_variant IN ('strategic', 'culture', 'storyteller')),
    edited_content TEXT,
    
    -- Metadata from AI analysis
    detected_tone TEXT CHECK (detected_tone IN ('formal', 'informal')),
    key_focus_points TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Index for user's letters lookup
CREATE INDEX IF NOT EXISTS idx_motivation_letters_user_id 
ON public.motivation_letters(user_id);

-- Index for vacancy association
CREATE INDEX IF NOT EXISTS idx_motivation_letters_vacancy_id 
ON public.motivation_letters(vacancy_id);

-- Index for recent letters
CREATE INDEX IF NOT EXISTS idx_motivation_letters_created_at 
ON public.motivation_letters(created_at DESC);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.motivation_letters ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Policy: Users can view their own letters
CREATE POLICY "Users can view own motivation letters"
ON public.motivation_letters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can create their own letters
CREATE POLICY "Users can create own motivation letters"
ON public.motivation_letters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own letters
CREATE POLICY "Users can update own motivation letters"
ON public.motivation_letters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own letters
CREATE POLICY "Users can delete own motivation letters"
ON public.motivation_letters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 5. UPDATE TRIGGER for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_motivation_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_motivation_letters_updated_at
BEFORE UPDATE ON public.motivation_letters
FOR EACH ROW
EXECUTE FUNCTION update_motivation_letters_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'motivation_letters';

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'motivation_letters';

-- Verify policies
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'motivation_letters'
ORDER BY policyname;
