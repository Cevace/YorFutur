-- Add profile_photo_url column to profiles table
-- This column stores the Supabase Storage path for the user's profile photo

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_photo_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_photo_url TEXT;
    END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN profiles.profile_photo_url IS 'Supabase Storage path for user profile photo (e.g., profile-photos/user-id/photo.jpg)';
