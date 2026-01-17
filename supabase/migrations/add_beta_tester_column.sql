-- =====================================================
-- Add Beta Tester Support to Profiles
-- =====================================================
-- This migration adds an is_beta_tester column to control access
-- during the beta phase before public launch

-- Step 1: Add is_beta_tester column with default false
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;

-- Step 2: Create index for faster beta tester queries
CREATE INDEX IF NOT EXISTS idx_profiles_beta_tester 
ON public.profiles(is_beta_tester);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.profiles.is_beta_tester IS 'Indicates if user has beta testing access before public launch';

-- Step 4: Verify migration
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_beta_tester';
