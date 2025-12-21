-- Ensure email column exists in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'email';
