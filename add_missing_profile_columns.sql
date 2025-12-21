-- Add all potentially missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS house_number text; -- Included again just in case

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('street', 'postal_code', 'city', 'phone', 'house_number');
