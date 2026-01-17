-- =====================================================
-- Create Waitlist Table for Pre-Launch Email Signups (IDEMPOTENT VERSION)
-- =====================================================
-- This table stores email addresses from users who sign up
-- via the waitlist landing page before public launch

-- Step 1: Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_to_brevo BOOLEAN DEFAULT false,
    brevo_contact_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email 
ON public.waitlist(email);

CREATE INDEX IF NOT EXISTS idx_waitlist_created 
ON public.waitlist(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_synced 
ON public.waitlist(synced_to_brevo) 
WHERE synced_to_brevo = false;

-- Step 3: Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can signup to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Super admins can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Super admins can update waitlist" ON public.waitlist;

-- Step 5: Create RLS policies
-- Allow anyone to insert (for public signup form)
CREATE POLICY "Anyone can signup to waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated super admins can view waitlist
CREATE POLICY "Super admins can view waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Only super admins can update waitlist
CREATE POLICY "Super admins can update waitlist"
ON public.waitlist
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Step 6: Add comments for documentation
COMMENT ON TABLE public.waitlist IS 'Stores email signups for pre-launch waitlist';
COMMENT ON COLUMN public.waitlist.email IS 'Email address of waitlist subscriber';
COMMENT ON COLUMN public.waitlist.synced_to_brevo IS 'Whether this email has been synced to Brevo';
COMMENT ON COLUMN public.waitlist.brevo_contact_id IS 'Brevo contact ID if synced';
COMMENT ON COLUMN public.waitlist.metadata IS 'Additional metadata (referrer, UTM params, etc)';

-- Step 7: Verify migration
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;
