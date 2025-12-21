-- Job Radar Database Schema
-- Creates table for storing user search history and extends job_applications for pitch storage

-- 1. Create job_radar_searches table
CREATE TABLE IF NOT EXISTS job_radar_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    location TEXT,
    freshness TEXT CHECK (freshness IN ('24h', '3days', '7days')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for job_radar_searches
ALTER TABLE job_radar_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own searches
CREATE POLICY "Users can view own radar searches"
    ON job_radar_searches FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own searches
CREATE POLICY "Users can create own radar searches"
    ON job_radar_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Extend job_applications table to store generated pitches
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS pitch_text TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_radar_searches_user_id ON job_radar_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_radar_searches_created_at ON job_radar_searches(created_at DESC);
