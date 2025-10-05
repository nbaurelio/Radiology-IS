-- =====================================================
-- Update Users Table with Email Addresses
-- =====================================================
-- This adds/updates email addresses in your users table
-- Run in Supabase SQL Editor

-- Update ADMIN001 with email
UPDATE users
SET email = 'admin001@radiology.local'
WHERE user_id = 'ADMIN001';

-- Update RAD001 with email
UPDATE users
SET email = 'rad001@radiology.local'
WHERE user_id = 'RAD001';

-- Update TECH001 with email
UPDATE users
SET email = 'tech001@radiology.local'
WHERE user_id = 'TECH001';

-- Verify the updates
SELECT user_id, first_name, last_name, email, is_active
FROM users
WHERE user_id IN ('ADMIN001', 'RAD001', 'TECH001');

-- Expected result: All users should now have their email addresses
