-- Query to check the structure of the patients table
-- Run this in Supabase SQL Editor to see what columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'patients'
ORDER BY 
    ordinal_position;
