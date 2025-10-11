# 🚀 Quick Start for Collaborators

## Can't Log In? Follow This Checklist

### ✅ Step 1: Update Supabase Config (1 min)
Edit `main/shared/supabase-config.js`:
- Update `SUPABASE_URL` with your Supabase project URL
- Update `SUPABASE_ANON_KEY` with your Supabase anon key

**Where to find these:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

---

### ✅ Step 2: Run Database Setup (2 min)

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file: `main/database/complete-database-setup.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

**Expected:** You should see "Success" and a verification query showing 3 users.

---

**Note:** You may see a warning about "destructive operations" - this is safe! The script only drops/recreates security policies, not data.

---

### ✅ Step 3: Test Login (1 min)

1. Open the application in your browser
2. Go to Login page
3. Enter:
   - **Email:** `admin001@radiology.local`
   - **Password:** `admin123`
4. Click **Login**

**Expected:** You should be redirected to the Dashboard! 🎉

---

## Still Having Issues?

### Check Browser Console (F12)
Look for error messages that might give clues.

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid credentials" | Password hash mismatch | Re-run Step 2 SQL script |
| "User account not found" | Database tables missing | Re-run Step 2 SQL script |
| "RLS policy violation" | Policies not set up | Re-run Step 2 SQL script |
| "relation does not exist" | Tables not created | Re-run Step 2 SQL script |

---

## Full Documentation

For detailed explanations, see:
- 📖 `docs/COLLABORATOR-SETUP.md` - Complete setup guide
- 📖 `main/database/README.md` - Database scripts explanation
- 📖 `docs/COMPLETE-SETUP-GUIDE.md` - Advanced setup options

---

## Test Credentials

After setup, you can log in with any of these:

| User Type | Email | User ID | Password |
|-----------|-------|---------|----------|
| Administrator | admin001@radiology.local | ADMIN001 | admin123 |
| Radiologist | rad001@radiology.local | RAD001 | admin123 |
| Rad Tech | tech001@radiology.local | TECH001 | admin123 |

**Note:** Both email and User ID work for login!

---

## What This Sets Up

✅ Supabase Authentication (auth.users)  
✅ User Types (Administrator, Radiologist, Rad Tech)  
✅ Users Table (linked to auth)  
✅ Patients Table  
✅ Reports Table  
✅ Studies Table  
✅ Row Level Security Policies  

---

## Need Help?

If you're still stuck after following these steps:
1. Check that you're using the correct Supabase project
2. Verify your Supabase URL and key in `supabase-config.js`
3. Check Supabase Dashboard → Logs for errors
4. Ask the project owner for help

---

**Total Time:** ~5 minutes  
**Difficulty:** Very Easy  

You're all set! Happy coding! 🎉
