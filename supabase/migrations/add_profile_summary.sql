-- Add profile_summary column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_summary TEXT;
