# Database Setup Scripts

## For Collaborators: Can't Log In?

If you just pulled this project and can't log in, you need to set up the database first.

### Quick Start (15 minutes)

**Option 1: Follow the Complete Guide**
📖 Read: `../../docs/COLLABORATOR-SETUP.md`

**Option 2: Run the All-in-One Script**
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `complete-database-setup.sql`
3. Click **Run**
4. Then manually create auth users (see instructions in the script comments)

---

## What You Need

### 1. Auth Users (Manual Setup Required)
Go to **Supabase Dashboard → Authentication → Users** and create:

| Email | Password | User Metadata |
|-------|----------|---------------|
| admin001@radiology.local | admin123 | `{"user_id": "ADMIN001"}` |
| rad001@radiology.local | admin123 | `{"user_id": "RAD001"}` |
| tech001@radiology.local | admin123 | `{"user_id": "TECH001"}` |

**Important:** Check "Auto Confirm User" when creating them!

### 2. Database Tables (Run SQL Script)
Run `complete-database-setup.sql` to create:
- ✅ user_types table
- ✅ users table  
- ✅ patients table
- ✅ reports table
- ✅ studies table
- ✅ All RLS policies

---

## Test Login

After setup, try logging in with:
- **Email:** `admin001@radiology.local`
- **Password:** `admin123`

Or use User ID:
- **User ID:** `ADMIN001`
- **Password:** `admin123`

Both should work! ✅

---

## Individual Scripts

If you prefer to run scripts one at a time:

1. `complete-database-setup.sql` - **Run this first** (creates all tables)
2. `add-userid-to-auth-users.sql` - Links auth users to your users table
3. `update-users-with-emails.sql` - Updates users table with emails
4. `create-studies-table.sql` - Creates studies table (already in complete script)
5. `check-patients-table.sql` - Diagnostic query to check patients table

---

## Troubleshooting

### "Invalid credentials"
- Auth user doesn't exist → Create in Authentication → Users
- Wrong password → Check password
- Email not confirmed → Check "Auto Confirm User"

### "User account not found or inactive"  
- User not in users table → Run `complete-database-setup.sql`
- Email mismatch → Check emails match between auth and users table

### "new row violates row-level security policy"
- Not logged in → Make sure login succeeded
- RLS policies missing → Re-run `complete-database-setup.sql`

---

## Architecture

```
┌─────────────────────────────────────┐
│  Supabase Authentication            │
│  (auth.users)                       │
│  ├─ email: admin001@radiology.local │
│  ├─ password: (hashed)              │
│  └─ metadata: {user_id: "ADMIN001"} │
└─────────────────────────────────────┘
              ↓ Login validates here
              ↓
┌─────────────────────────────────────┐
│  Your Users Table                   │
│  (public.users)                     │
│  ├─ user_id: ADMIN001               │
│  ├─ email: admin001@radiology.local │
│  ├─ first_name: Admin               │
│  ├─ last_name: User                 │
│  └─ user_type_id: 1 (Administrator) │
└─────────────────────────────────────┘
              ↓ Looks up user details
              ↓
┌─────────────────────────────────────┐
│  Session Storage                    │
│  (localStorage)                     │
│  └─ Stores user session for app     │
└─────────────────────────────────────┘
```

---

## Need More Help?

See the full guide: `../../docs/COLLABORATOR-SETUP.md`
