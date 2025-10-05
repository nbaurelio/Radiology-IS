# Complete Supabase Auth Setup Guide

## Overview
This guide will set up email-based authentication with Supabase Auth, linking to your existing users table.

---

## Step 1: Add User ID to Supabase Auth Metadata (5 min)

### Run in Supabase SQL Editor:
```sql
-- Copy contents from: add-userid-to-auth-users.sql
```

This adds user_id to the auth users' metadata so you can reference it later.

**Verify:** Check that each auth user now has `user_id` in their metadata.

---

## Step 2: Update Users Table with Emails (2 min)

### Run in Supabase SQL Editor:
```sql
-- Copy contents from: update-users-with-emails.sql
```

This ensures your users table has the matching email addresses.

**Verify:** All users should have email addresses matching their auth accounts.

---

## Step 3: Replace Config File (1 min)

### In your terminal:
```powershell
cd c:\Chloe\RADIOLOGY_IS\Radiology-IS
Remove-Item main\shared\supabase-config.js
Rename-Item main\shared\supabase-config-email.js supabase-config.js
```

This replaces the old config with the new email-based authentication.

---

## Step 4: Update RLS Policies (2 min)

### Run in Supabase SQL Editor:
```sql
-- Copy contents from: FINAL-RLS-UPDATE.sql
```

This sets policies to allow only authenticated users.

**Verify:** All policies should show `roles = {authenticated}`

---

## Step 5: Update Login Page Label (Optional)

If you want the login form to say "Email" instead of "User ID":

### Edit: `main/Login/login.html`
Change line 26:
```html
<label for="userId">Email</label>
```

Change placeholder on line 31:
```html
placeholder="Enter your email"
```

Update test users text (lines 57-60):
```html
Test users:<br>
Admin: admin001@radiology.local / admin123<br>
Radiologist: rad001@radiology.local / admin123<br>
Rad Tech: tech001@radiology.local / admin123
```

---

## Step 6: Test Login (5 min)

### Test with Email:
1. Open your application
2. Login with:
   - Email: `admin001@radiology.local`
   - Password: `admin123`

### Test with User ID (still works!):
1. Login with:
   - User ID: `ADMIN001`
   - Password: `admin123`

**Both should work!** The code automatically converts User ID to email format.

---

## Step 7: Test Patient Creation

1. After logging in, go to Patients page
2. Click **+** to add a patient
3. Fill in the form and submit

**Expected:** ✅ Patient created successfully without RLS errors!

---

## How It Works Now

### Login Flow:
```
1. User enters: admin001@radiology.local (or ADMIN001)
   ↓
2. Code detects if it's email or converts: admin001@radiology.local
   ↓
3. Supabase Auth validates credentials
   ↓
4. Creates authenticated session (✅ RLS allows)
   ↓
5. Looks up user in users table by email
   ↓
6. Returns user details with user_id, role, etc.
```

### Data Flow:
```
Supabase Auth (auth.users)          Your Users Table
├─ email: admin001@radiology.local  ├─ user_id: ADMIN001
├─ password: (hashed)               ├─ email: admin001@radiology.local
└─ metadata: {user_id: "ADMIN001"}  ├─ first_name: Admin
                                    ├─ last_name: User
                                    └─ user_type_id: 1
```

---

## Key Features

✅ **Flexible Login:** Accept both email OR user ID
✅ **Proper Authentication:** Uses Supabase Auth
✅ **RLS Compliant:** Authenticated role has permissions
✅ **Linked Data:** Auth metadata includes user_id
✅ **Backward Compatible:** Old user IDs still work

---

## Adding New Users

When adding a new user:

### 1. Create in Supabase Auth:
- Go to **Authentication** → **Users** → **Add User**
- Email: `{userid}@radiology.local` (e.g., `doc001@radiology.local`)
- Password: (set password)
- User Metadata: `{"user_id": "DOC001"}`

### 2. Add to Users Table:
```sql
INSERT INTO users (user_id, first_name, last_name, email, user_type_id, is_active)
VALUES ('DOC001', 'Doctor', 'Name', 'doc001@radiology.local', 2, true);
```

---

## Troubleshooting

### Issue: "Invalid credentials"
**Solution:** Check that:
1. Auth user exists in Supabase Auth
2. Email/password are correct
3. User is not disabled

### Issue: "User account not found or inactive"
**Solution:** Check that:
1. User exists in `users` table
2. Email matches between auth and users table
3. `is_active = true` in users table

### Issue: Still getting RLS errors
**Solution:**
1. Verify you're logged in (check DevTools Console)
2. Check RLS policies include `authenticated` role
3. Refresh the page after login

---

## Rollback (If Needed)

If something goes wrong:

```powershell
cd c:\Chloe\RADIOLOGY_IS\Radiology-IS
Copy-Item main\shared\supabase-config-backup.js main\shared\supabase-config.js -Force
```

Then run `quick-fix-rls.sql` to add `anon` back to policies.

---

## Summary

**Total Time:** ~15 minutes
**Complexity:** Medium
**Benefits:**
- ✅ Proper authentication
- ✅ RLS compliance
- ✅ Better security
- ✅ Flexible login (email or user ID)
- ✅ Linked user data

**You're all set!** 🎉
