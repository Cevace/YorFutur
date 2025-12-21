-- Fix RLS policies for tailored_resumes table

-- Enable RLS
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can insert own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can update own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can delete own tailored resumes" ON tailored_resumes;

-- Re-create policies
CREATE POLICY "Users can view own tailored resumes"
    ON tailored_resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tailored resumes"
    ON tailored_resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tailored resumes"
    ON tailored_resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tailored resumes"
    ON tailored_resumes FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON tailored_resumes TO authenticated;
GRANT ALL ON tailored_resumes TO service_role;
