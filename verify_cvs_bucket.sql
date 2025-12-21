-- Verification Query: Check if cvs bucket exists
SELECT * FROM storage.buckets WHERE id = 'cvs';

-- If the bucket exists, check the files in it
SELECT * FROM storage.objects WHERE bucket_id = 'cvs';

-- Check database records in cvs table
-- This will show you what the database thinks exists (but may not have actual files)
-- You'll need to run this in your application database (not storage)
-- SELECT * FROM cvs ORDER BY created_at DESC LIMIT 5;
