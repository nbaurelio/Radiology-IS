# Setup Guide for Collaborators

## Problem
After pulling the latest commits, you can't log in because the database isn't set up yet.

## Why This Happens
The login system uses **Supabase Authentication** which requires:
- Auth users in Supabase's `auth.users` table
- Application users in your custom `users` table  
- These must be linked together

Code is in Git, but **database setup is not**. You need to set up your own Supabase database.

---

## Quick Setup (15 minutes)

### Prerequisites
- You have a Supabase account
- You have access to the Supabase project (or created your own)
- You've updated `main/shared/supabase-config.js` with your Supabase URL and key

---

### Step 1: Create Auth Users in Supabase (5 min)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** (manual)
4. Create these three test users:

#### Admin User
- **Email:** `admin001@radiology.local`
- **Password:** `admin123`
- **Auto Confirm User:** ✅ Yes
- **User Metadata (JSON):**
  ```json
  {"user_id": "ADMIN001"}
  ```

#### Radiologist User
- **Email:** `rad001@radiology.local`
- **Password:** `admin123`
- **Auto Confirm User:** ✅ Yes
- **User Metadata (JSON):**
  ```json
  {"user_id": "RAD001"}
  ```

#### Rad Tech User
- **Email:** `tech001@radiology.local`
- **Password:** `admin123`
- **Auto Confirm User:** ✅ Yes
- **User Metadata (JSON):**
  ```json
  {"user_id": "TECH001"}
  ```

---

### Step 2: Create User Types Table (2 min)

Go to **SQL Editor** in Supabase and run:

```sql
-- Create user_types table
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
```

---

### Step 3: Create Users Table (2 min)

Run this in **SQL Editor**:

```sql
-- Create users table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

### Step 4: Insert Test Users (2 min)

Run this in **SQL Editor**:

```sql
-- Insert test users into users table
INSERT INTO users (user_id, first_name, last_name, email, user_type_id, is_active) VALUES
('ADMIN001', 'Admin', 'User', 'admin001@radiology.local', 1, true),
('RAD001', 'Radiologist', 'One', 'rad001@radiology.local', 2, true),
('TECH001', 'Tech', 'One', 'tech001@radiology.local', 3, true)
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    user_type_id = EXCLUDED.user_type_id;
```

---

### Step 5: Set Up Row Level Security (RLS) (2 min)

Run this in **SQL Editor**:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all users
CREATE POLICY "Allow authenticated users to read users"
ON users FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on user_types table
ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read user types
CREATE POLICY "Allow authenticated users to read user_types"
ON user_types FOR SELECT
TO authenticated
USING (true);
```

---

### Step 6: Create Patients Table (2 min)

Run this in **SQL Editor**:

```sql
-- Create patients table
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

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to patients
CREATE POLICY "Allow authenticated users to read patients"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert patients"
ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update patients"
ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete patients"
ON patients FOR DELETE TO authenticated USING (true);
```

---

### Step 7: Create Reports Table (Optional, 2 min)

If you're using the Reports feature:

```sql
-- Create reports table
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

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users to read reports"
ON reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert reports"
ON reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update reports"
ON reports FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete reports"
ON reports FOR DELETE TO authenticated USING (true);
```

---

### Step 8: Test Login (2 min)

1. Open the application in your browser
2. Go to the Login page
3. Try logging in with:
   - **Email:** `admin001@radiology.local`
   - **Password:** `admin123`

**Expected Result:** ✅ You should be redirected to the Dashboard!

---

## Alternative: Use User ID Instead of Email

The login form also accepts User IDs:
- **User ID:** `ADMIN001`
- **Password:** `admin123`

Both email and User ID work!

---

## Troubleshooting

### Issue: "Invalid credentials"
**Cause:** Auth user doesn't exist or password is wrong

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Verify the user exists
3. Check the email/password
4. Make sure "Email Confirmed" is checked

---

### Issue: "User account not found or inactive"
**Cause:** User exists in auth.users but not in your users table

**Solution:**
1. Go to SQL Editor
2. Run: `SELECT * FROM users WHERE email = 'admin001@radiology.local';`
3. If no results, re-run Step 4 to insert users

---

### Issue: "new row violates row-level security policy"
**Cause:** RLS policies not set up correctly

**Solution:**
1. Make sure you're logged in (authenticated)
2. Re-run Step 5 to set up RLS policies
3. Refresh the page

---

### Issue: "relation 'users' does not exist"
**Cause:** Tables not created yet

**Solution:**
1. Re-run Steps 2-4 to create all tables
2. Refresh the page

---

## What Each Test User Can Do

| User ID | Email | Password | Role | Access |
|---------|-------|----------|------|--------|
| ADMIN001 | admin001@radiology.local | admin123 | Administrator | Full access to all features |
| RAD001 | rad001@radiology.local | admin123 | Radiologist | Read studies, create reports |
| TECH001 | tech001@radiology.local | admin123 | Rad Tech | Upload studies, manage patients |

---

## Need Help?

If you're still having issues:

1. **Check browser console** (F12) for error messages
2. **Check Supabase logs** in Dashboard → Logs
3. **Verify your Supabase URL and key** in `main/shared/supabase-config.js`
4. **Make sure you're using the correct Supabase project**

---

## Summary

✅ Created 3 auth users in Supabase Authentication  
✅ Created user_types, users, patients tables  
✅ Set up Row Level Security policies  
✅ Can now log in with email or User ID  

**You're ready to go!** 🎉
