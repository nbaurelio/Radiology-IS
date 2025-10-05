-- =====================================================
-- Add User ID to Supabase Auth Users Metadata
-- =====================================================
-- This updates the auth users to include user_id in their metadata
-- Run in Supabase SQL Editor

-- Update admin001@radiology.local
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"user_id": "ADMIN001"}'::jsonb
WHERE email = 'admin001@radiology.local';

-- Update rad001@radiology.local
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"user_id": "RAD001"}'::jsonb
WHERE email = 'rad001@radiology.local';

-- Update tech001@radiology.local
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"user_id": "TECH001"}'::jsonb
WHERE email = 'tech001@radiology.local';

-- Verify the updates
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_id' as user_id,
    raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@radiology.local';

-- Expected result: Each user should now have user_id in their metadata
