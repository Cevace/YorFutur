-- Assessment Scores Schema for Cevace Assessment Trainer
-- Run this in Supabase SQL Editor

-- Create assessment_scores table
CREATE TABLE IF NOT EXISTS public.assessment_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('abstract', 'verbal', 'numerical', 'logical', 'sequences', 'analogies')),
    mode TEXT NOT NULL CHECK (mode IN ('drill', 'exam')),
    raw_score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    sten_score INTEGER NOT NULL CHECK (sten_score >= 1 AND sten_score <= 10),
    percentile INTEGER NOT NULL CHECK (percentile >= 0 AND percentile <= 100),
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    speed INTEGER NOT NULL CHECK (speed >= 0 AND speed <= 100),
    difficulty_handling INTEGER NOT NULL CHECK (difficulty_handling >= 0 AND difficulty_handling <= 100),
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_assessment_scores_user_id ON public.assessment_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_category ON public.assessment_scores(category);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_created_at ON public.assessment_scores(created_at DESC);

-- Enable RLS
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/create their own scores
CREATE POLICY "Users can view own scores" ON public.assessment_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.assessment_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- View for user statistics (average STEN, total completed, etc.)
CREATE OR REPLACE VIEW public.user_assessment_stats AS
SELECT 
    user_id,
    COUNT(*) as total_completed,
    ROUND(AVG(sten_score)::numeric, 1) as avg_sten_score,
    MAX(sten_score) as best_sten_score,
    ROUND(AVG(accuracy)::numeric, 0) as avg_accuracy,
    ROUND(AVG(percentile)::numeric, 0) as avg_percentile
FROM public.assessment_scores
GROUP BY user_id;

-- Grant permissions
GRANT SELECT ON public.user_assessment_stats TO authenticated;
