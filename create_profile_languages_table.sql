-- Migration: Add profile_languages table and update profiles table
-- This migration adds support for language skills and additional contact information

-- 1. Update profiles table with missing columns (if they don't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS summary TEXT;

-- 2. Create profile_languages table
CREATE TABLE IF NOT EXISTS profile_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    proficiency TEXT NOT NULL CHECK (proficiency IN ('Moedertaal', 'Vloeiend', 'Goed', 'Basis')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE profile_languages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for profile_languages
CREATE POLICY "Users can view own languages"
    ON profile_languages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own languages"
    ON profile_languages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own languages"
    ON profile_languages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own languages"
    ON profile_languages FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_languages_user_id ON profile_languages(user_id);

-- 6. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for profile_languages
DROP TRIGGER IF EXISTS update_profile_languages_updated_at ON profile_languages;
CREATE TRIGGER update_profile_languages_updated_at
    BEFORE UPDATE ON profile_languages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Comments for documentation
COMMENT ON TABLE profile_languages IS 'Stores language skills for user profiles';
COMMENT ON COLUMN profile_languages.language IS 'Language name (e.g., Nederlands, English)';
COMMENT ON COLUMN profile_languages.proficiency IS 'Proficiency level: Moedertaal, Vloeiend, Goed, or Basis';
COMMENT ON COLUMN profiles.summary IS 'Executive summary or professional bio from CV';
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.city IS 'City of residence';
COMMENT ON COLUMN profiles.country IS 'Country of residence';
COMMENT ON COLUMN profiles.linkedin_url IS 'LinkedIn profile URL';
