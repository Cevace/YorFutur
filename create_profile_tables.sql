-- ============================================
-- Cevace Core Profile Engine - Database Schema
-- ============================================
-- Creates structured tables for user experiences and education
-- Run this in Supabase SQL Editor

-- Create profile_experiences table
CREATE TABLE IF NOT EXISTS profile_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile_educations table
CREATE TABLE IF NOT EXISTS profile_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    school TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON profile_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_dates ON profile_experiences(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_educations_user_id ON profile_educations(user_id);
CREATE INDEX IF NOT EXISTS idx_educations_dates ON profile_educations(user_id, start_date DESC);

-- Enable Row Level Security
ALTER TABLE profile_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_educations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_experiences
CREATE POLICY "Users can view own experiences"
    ON profile_experiences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences"
    ON profile_experiences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
    ON profile_experiences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences"
    ON profile_experiences FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for profile_educations
CREATE POLICY "Users can view own educations"
    ON profile_educations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own educations"
    ON profile_educations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own educations"
    ON profile_educations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own educations"
    ON profile_educations FOR DELETE
    USING (auth.uid() = user_id);

-- Verify tables were created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('profile_experiences', 'profile_educations');
