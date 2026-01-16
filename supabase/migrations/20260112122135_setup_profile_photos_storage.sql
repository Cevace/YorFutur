-- Setup Supabase Storage bucket for profile photos with RLS policies

-- Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This might already be enabled globally

-- Policy 1: Public can view all profile photos
CREATE POLICY "Public photos are viewable by everyone"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile-photos');

-- Policy 2: Users can upload to their own folder only
CREATE POLICY "Users can upload their own photo"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 3: Users can update their own photos
CREATE POLICY "Users can update their own photo"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 4: Users can delete their own photos
CREATE POLICY "Users can delete their own photo"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
