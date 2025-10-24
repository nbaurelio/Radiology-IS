-- Add findings, impression, and recommendations columns to reports table
-- Run this in Supabase SQL Editor

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS findings TEXT,
ADD COLUMN IF NOT EXISTS impression TEXT,
ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('findings', 'impression', 'recommendations');
