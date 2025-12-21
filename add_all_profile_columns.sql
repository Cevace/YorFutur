-- Add ALL potentially missing columns to profiles table
-- This covers every field used in the Edit User form

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS house_number text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'user';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
    'first_name', 'last_name', 
    'street', 'house_number', 
    'postal_code', 'city', 
    'phone', 'user_role'
);
