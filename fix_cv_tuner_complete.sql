-- Comprehensive Fix for CV Tuner (Storage & Database)

-- 1. Create Storage Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tailored-resumes', 'tailored-resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Fix Storage Policies (Drop existing to ensure clean slate)
DROP POLICY IF EXISTS "Users can upload own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Resumes" ON storage.objects;

-- Create Storage Policies
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tailored-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tailored-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tailored-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tailored-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Fix Database RLS for tailored_resumes table
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can insert own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can update own tailored resumes" ON tailored_resumes;
DROP POLICY IF EXISTS "Users can delete own tailored resumes" ON tailored_resumes;

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

-- Grant permissions
GRANT ALL ON tailored_resumes TO authenticated;
GRANT ALL ON tailored_resumes TO service_role;
