-- Drop existing studies table and recreate with correct structure
-- WARNING: This will delete all existing data in the studies table!

DROP TABLE IF EXISTS public.studies CASCADE;

-- Create studies table for DICOM uploads
-- This table stores uploaded DICOM studies that are pending report creation

CREATE TABLE public.studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id TEXT UNIQUE NOT NULL,
    patient_uuid UUID NOT NULL, -- Foreign key to patients.id (UUID)
    dicom_file_url TEXT,
    dicom_files JSONB, -- Array of file metadata {name, size, type}
    clinical_history TEXT,
    priority TEXT NOT NULL DEFAULT 'routine', -- routine, urgent, stat
    status TEXT NOT NULL DEFAULT 'pending', -- pending, reading, completed
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_patient FOREIGN KEY (patient_uuid) REFERENCES public.patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_studies_patient_uuid ON studies(patient_uuid);
CREATE INDEX IF NOT EXISTS idx_studies_study_id ON studies(study_id);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_created_at ON studies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

-- Create policies for studies table
-- Allow authenticated users to read all studies
CREATE POLICY "Allow authenticated users to read studies"
ON studies FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert studies
CREATE POLICY "Allow authenticated users to insert studies"
ON studies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update studies
CREATE POLICY "Allow authenticated users to update studies"
ON studies FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete studies
CREATE POLICY "Allow authenticated users to delete studies"
ON studies FOR DELETE
TO authenticated
USING (true);
