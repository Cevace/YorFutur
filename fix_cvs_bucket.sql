-- Fix for CVs Storage Bucket (Resume Scanner)
-- This creates the 'cvs' bucket and sets up permissions for uploaded CVs

-- 1. Create cvs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies to ensure clean slate
DROP POLICY IF EXISTS "Users can upload cvs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view cvs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cvs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cvs" ON storage.objects;

-- 3. Create storage policies for cvs bucket
CREATE POLICY "Users can upload cvs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view cvs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view cvs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');

CREATE POLICY "Users can delete cvs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
