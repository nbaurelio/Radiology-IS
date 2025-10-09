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

### ✅ Step 2: Create Auth Users (5 min)

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create 3 users with these details:

#### User 1: Admin
```
Email: admin001@radiology.local
Password: admin123
Auto Confirm User: ✅ YES
User Metadata: {"user_id": "ADMIN001"}
```

#### User 2: Radiologist
```
Email: rad001@radiology.local
Password: admin123
Auto Confirm User: ✅ YES
User Metadata: {"user_id": "RAD001"}
```

#### User 3: Rad Tech
```
Email: tech001@radiology.local
Password: admin123
Auto Confirm User: ✅ YES
User Metadata: {"user_id": "TECH001"}
```

**Important:** Don't forget to add the User Metadata JSON for each user!

---

### ✅ Step 3: Run Database Setup (2 min)

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file: `main/database/complete-database-setup.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

**Expected:** You should see "Success" and a verification query showing 3 users.

---

### ✅ Step 4: Test Login (1 min)

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
| "Invalid credentials" | Auth user doesn't exist | Re-do Step 2 |
| "User account not found" | Database tables missing | Re-run Step 3 |
| "RLS policy violation" | Not authenticated | Make sure Step 2 is complete |
| "relation does not exist" | Tables not created | Re-run Step 3 |

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

**Total Time:** ~10 minutes  
**Difficulty:** Easy  

You're all set! Happy coding! 🎉
