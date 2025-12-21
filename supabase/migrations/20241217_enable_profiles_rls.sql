-- Migration: Enable RLS on profiles table
-- This migration enables Row Level Security on the profiles table
-- and ensures existing policies are actually enforced.
-- Run this in Supabase SQL Editor or via supabase db push

-- 1. Enable RLS on profiles table (required for existing policies to work)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is enabled (optional check)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Note: The following policies already exist and will now be enforced:
-- - "Public can view profiles with active live link"
-- - "Public profiles are viewable by everyone."
-- - "Users can insert their own profile."
-- - "Users can update own profile."
-- - allow_select_own_profile
-- - allow_update_own_profile
-- - super_admin_select_all
-- - super_admin_update_all
