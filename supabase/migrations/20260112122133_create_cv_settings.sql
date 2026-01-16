-- Create cv_settings table for storing user CV template preferences
CREATE TABLE IF NOT EXISTS cv_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL DEFAULT 'modern' CHECK (template_id IN ('modern', 'classic-sidebar', 'modern-header', 'photo-focus')),
    accent_color TEXT NOT NULL DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cv_settings_user_id ON cv_settings(user_id);

-- Enable Row Level Security
ALTER TABLE cv_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view their own CV settings"
    ON cv_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert their own CV settings"
    ON cv_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update their own CV settings"
    ON cv_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete their own CV settings"
    ON cv_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cv_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER cv_settings_updated_at_trigger
    BEFORE UPDATE ON cv_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_cv_settings_updated_at();
