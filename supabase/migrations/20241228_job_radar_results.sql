-- Job Radar Results Table
-- Stores found vacancies from searches (both manual and cron)

CREATE TABLE IF NOT EXISTS job_radar_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  snippet TEXT,
  url TEXT NOT NULL,
  posted_date TEXT,
  search_query TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_job_radar_results_user_id ON job_radar_results(user_id);

-- RLS Policy
ALTER TABLE job_radar_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own results" ON job_radar_results;
CREATE POLICY "Users can view own results" ON job_radar_results 
  FOR ALL USING (auth.uid() = user_id);

-- Add sector column to job_radar_searches if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'job_radar_searches' AND column_name = 'sector'
  ) THEN
    ALTER TABLE job_radar_searches ADD COLUMN sector TEXT DEFAULT 'alles';
  END IF;
END $$;
