-- Add index for LinkedIn URL lookups
-- Note: linkedin_url column already exists in profiles table

-- Create index for faster lookups when checking profile completeness
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_url 
ON public.profiles(linkedin_url) 
WHERE linkedin_url IS NOT NULL AND linkedin_url != '';

-- NOTE: No constraint added for existing data compatibility
-- Validation happens in application layer (actions/profile-completeness.ts)

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.linkedin_url IS 'User LinkedIn profile URL (recommended for CV generation). Validated in application layer.';
