-- =====================================================
-- COMPLETE DATABASE SETUP FOR COLLABORATORS
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- This sets up all tables and test data needed for login
-- 
-- IMPORTANT: Before running this, create auth users manually:
-- Go to Authentication → Users → Add User (see COLLABORATOR-SETUP.md)
-- =====================================================

-- =====================================================
-- 1. CREATE USER TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_types (
    id SERIAL PRIMARY KEY,
    type_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert user types
INSERT INTO user_types (id, type_name, description) VALUES
(1, 'Administrator', 'Full system access'),
(2, 'Radiologist', 'Can read and report studies'),
(3, 'Rad Tech', 'Can upload studies and manage patients')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    user_type_id INTEGER REFERENCES user_types(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 3. INSERT TEST USERS
-- =====================================================
-- Password for all test users: admin123
-- SHA-256 hash of 'admin123': 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO users (user_id, first_name, last_name, email, password_hash, user_type_id, is_active) VALUES
('ADMIN001', 'Admin', 'User', 'admin001@radiology.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, true),
('RAD001', 'Radiologist', 'One', 'rad001@radiology.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 2, true),
('TECH001', 'Tech', 'One', 'tech001@radiology.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 3, true)
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    user_type_id = EXCLUDED.user_type_id;

-- =====================================================
-- 4. CREATE PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    sex TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);

-- =====================================================
-- 5. CREATE REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id TEXT,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT,
    exam_type TEXT,
    study_date DATE,
    schedule TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    modality TEXT,
    priority TEXT DEFAULT 'routine',
    assigned_radiologist TEXT,
    assigned_radiologist_id UUID,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT false
);

-- =====================================================
-- 6. CREATE STUDIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id TEXT UNIQUE NOT NULL,
    patient_uuid UUID NOT NULL,
    dicom_file_url TEXT,
    dicom_files JSONB,
    clinical_history TEXT,
    priority TEXT NOT NULL DEFAULT 'routine',
    status TEXT NOT NULL DEFAULT 'pending',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_patient FOREIGN KEY (patient_uuid) REFERENCES public.patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for studies
CREATE INDEX IF NOT EXISTS idx_studies_patient_uuid ON studies(patient_uuid);
CREATE INDEX IF NOT EXISTS idx_studies_study_id ON studies(study_id);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_created_at ON studies(created_at DESC);

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES FOR USER_TYPES
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read user_types" ON user_types;
CREATE POLICY "Allow authenticated users to read user_types"
ON user_types FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- 9. CREATE RLS POLICIES FOR USERS
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow authenticated users to read users"
ON users FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- 10. CREATE RLS POLICIES FOR PATIENTS
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to insert patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to update patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to delete patients" ON patients;

CREATE POLICY "Allow authenticated users to read patients"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update patients"
ON patients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete patients"
ON patients FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 11. CREATE RLS POLICIES FOR REPORTS
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read reports" ON reports;
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON reports;
DROP POLICY IF EXISTS "Allow authenticated users to update reports" ON reports;
DROP POLICY IF EXISTS "Allow authenticated users to delete reports" ON reports;

CREATE POLICY "Allow authenticated users to read reports"
ON reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update reports"
ON reports FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete reports"
ON reports FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 12. CREATE RLS POLICIES FOR STUDIES
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read studies" ON studies;
DROP POLICY IF EXISTS "Allow authenticated users to insert studies" ON studies;
DROP POLICY IF EXISTS "Allow authenticated users to update studies" ON studies;
DROP POLICY IF EXISTS "Allow authenticated users to delete studies" ON studies;

CREATE POLICY "Allow authenticated users to read studies"
ON studies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert studies"
ON studies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update studies"
ON studies FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete studies"
ON studies FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 13. VERIFY SETUP
-- =====================================================

-- Check user_types
SELECT 'user_types' as table_name, COUNT(*) as record_count FROM user_types;

-- Check users
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- Check that emails match
SELECT 
    user_id, 
    first_name, 
    last_name, 
    email, 
    is_active,
    user_types.type_name
FROM users
LEFT JOIN user_types ON users.user_type_id = user_types.id
WHERE user_id IN ('ADMIN001', 'RAD001', 'TECH001');

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify auth users exist in Authentication → Users
-- 2. Make sure each auth user has user_id in metadata
-- 3. Test login with: admin001@radiology.local / admin123
-- =====================================================
