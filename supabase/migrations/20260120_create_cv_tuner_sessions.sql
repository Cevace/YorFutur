-- Create sessions table for CV Tuner → Ultimate CV Builder data handoff
-- Stores optimized CV data and analysis results for seamless transition

CREATE TABLE IF NOT EXISTS public.cv_tuner_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Input data from user
    vacancy_title TEXT NOT NULL,
    vacancy_text TEXT NOT NULL,
    
    -- Analysis results from CV Tuner
    initial_score INTEGER CHECK (initial_score >= 0 AND initial_score <= 100),
    optimized_score INTEGER CHECK (optimized_score >= 0 AND optimized_score <= 100),
    keywords_added TEXT[] DEFAULT '{}',
    missing_keywords TEXT[] DEFAULT '{}',
    
    -- Optimized CV data (full CVData object as JSON)
    optimized_cv_data JSONB NOT NULL,
    
    -- AI-recommended template based on vacancy type
    recommended_template TEXT DEFAULT 'modern',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Constraints
    CONSTRAINT check_template_valid CHECK (
        recommended_template IN ('modern', 'classic-sidebar', 'modern-header', 'photo-focus')
    )
);

-- Indexes for fast lookups
CREATE INDEX idx_tuner_sessions_user_created 
ON public.cv_tuner_sessions(user_id, created_at DESC);

CREATE INDEX idx_tuner_sessions_expires 
ON public.cv_tuner_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.cv_tuner_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own tuner sessions"
ON public.cv_tuner_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own sessions
CREATE POLICY "Users can create own tuner sessions"
ON public.cv_tuner_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own tuner sessions"
ON public.cv_tuner_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_tuner_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.cv_tuner_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE public.cv_tuner_sessions IS 'Temporary sessions for CV Tuner optimization data (auto-expires after 24h)';
COMMENT ON FUNCTION cleanup_expired_tuner_sessions() IS 'Removes expired tuner sessions. Call via cron job at /api/cron/cleanup-sessions';
