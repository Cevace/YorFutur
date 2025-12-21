-- Clean up orphaned CV records (CVs in database without files in storage)
-- Run this to remove old CV entries that don't have actual files

-- First, let's see what CVs you have in the database
-- SELECT id, filename, url, created_at FROM cvs ORDER BY created_at DESC;

-- To delete ALL old CV records and start fresh, uncomment and run this:
DELETE FROM cvs;

-- After running this, you can re-upload your CVs via /dashboard/scan
-- and they will work correctly now that the bucket exists!
