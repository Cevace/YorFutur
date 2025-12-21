-- Add analysis_insights field to motivation_letters table
-- This powers the "magical loading screen" by storing AI analysis steps

ALTER TABLE public.motivation_letters 
ADD COLUMN IF NOT EXISTS analysis_insights JSONB;

COMMENT ON COLUMN public.motivation_letters.analysis_insights IS 
'Stores the AI analysis steps (step1, step2, step3) shown during generation for transparency and user trust';
