-- ============================================
-- Cevace Resume System - Tailored Resumes Storage
-- ============================================
-- Stores AI-rewritten resumes with 60-day retention policy

-- Create tailored_resumes table
CREATE TABLE IF NOT EXISTS tailored_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vacancy_title TEXT NOT NULL,
    vacancy_text TEXT NOT NULL,
    rewritten_content JSONB NOT NULL,
    pdf_filename TEXT NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_user_id ON tailored_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_created ON tailored_resumes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_expires ON tailored_resumes(expires_at);

-- Enable Row Level Security
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own resumes
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

-- Function to automatically delete expired resumes
CREATE OR REPLACE FUNCTION delete_expired_resumes()
RETURNS void AS $$
BEGIN
    DELETE FROM tailored_resumes
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily
-- Note: This requires pg_cron extension or can be run via external cron job
-- COMMENT: Run this query daily: SELECT delete_expired_resumes();

-- Verify table was created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name = 'tailored_resumes';
