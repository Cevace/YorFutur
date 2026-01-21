-- Create metadata table for profile photo validation and tracking
-- Stores photo dimensions, file size, and validation data

CREATE TABLE IF NOT EXISTS public.profile_photo_metadata (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- bytes
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    last_validated_at TIMESTAMPTZ,
    
    -- Validation constraints
    CONSTRAINT check_photo_dimensions CHECK (width > 0 AND height > 0),
    CONSTRAINT check_file_size CHECK (file_size > 0 AND file_size <= 5242880), -- max 5MB
    CONSTRAINT check_mime_type CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

-- Enable RLS for security
ALTER TABLE public.profile_photo_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own photo metadata
CREATE POLICY "Users can view own photo metadata"
ON public.profile_photo_metadata
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own photo metadata
CREATE POLICY "Users can insert own photo metadata"
ON public.profile_photo_metadata
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own photo metadata
CREATE POLICY "Users can update own photo metadata"
ON public.profile_photo_metadata
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own photo metadata
CREATE POLICY "Users can delete own photo metadata"
ON public.profile_photo_metadata
FOR DELETE
USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE public.profile_photo_metadata IS 'Stores validation metadata for profile photos (dimensions, size, format)';
