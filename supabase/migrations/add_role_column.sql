-- =====================================================
-- RBAC Migration: Add Role Column to Profiles
-- =====================================================
-- Execute this SQL in Supabase SQL Editor

-- Step 1: Add role column with CHECK constraint
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('super_admin', 'support', 'content_manager', 'user'));

-- Step 2: Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Step 3: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Support can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Step 4: Create new RLS policies

-- Policy 1: Super admins have full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super admins have full access"
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy 2: Support has read-only access to all profiles
CREATE POLICY "Support can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'support')
  )
);

-- Policy 3: Users can view and update their own profile
CREATE POLICY "Users can manage own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() OR role != 'user');

-- Step 5: Verify migration
SELECT role, COUNT(*) as user_count 
FROM public.profiles 
GROUP BY role;

-- Note: After running this, you'll need to manually promote at least one user to 'super_admin'
-- Execute this (replace with your user ID):
-- UPDATE public.profiles SET role = 'super_admin' WHERE id = 'YOUR_USER_ID_HERE';
