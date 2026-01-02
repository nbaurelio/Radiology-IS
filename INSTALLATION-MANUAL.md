# Radiology Information System - Installation Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Test Credentials](#test-credentials)

---

## System Overview

The Radiology Information System is a web-based application for managing radiology studies, patient records, and diagnostic reports. It includes:

- **Frontend**: React + Vite application
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **DICOM Viewer**: Cornerstone.js for medical image viewing
- **Email Service**: EmailJS for account notifications

**Key Features:**
- Patient management
- Study scheduling and tracking
- DICOM image viewing
- Radiology report creation and management
- User role management (Admin, Radiologist, Rad Tech)
- Real-time notifications

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for version control)
   - Download: https://git-scm.com/
   - Verify installation: `git --version`

4. **Web Browser**
   - Chrome, Firefox, or Edge (latest version)

5. **Code Editor** (recommended)
   - Visual Studio Code: https://code.visualstudio.com/

### Required Accounts

1. **Supabase Account**
   - Sign up at: https://supabase.com/
   - Create a new project
   - Note your Project URL and API keys

2. **EmailJS Account** (for email notifications)
   - Sign up at: https://www.emailjs.com/
   - Create an email service
   - Create an email template
   - Note your Service ID, Template ID, Public Key, and Private Key

---

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/nbaurelio/Radiology-IS.git

# Navigate to the project directory
cd Radiology-IS
```

### Step 2: Install Dependencies

```bash
# Navigate to the React application directory
cd radiology-react

# Install all dependencies
npm install
```

**Expected Output:**
- npm will download and install all packages listed in `package.json`
- This may take 2-5 minutes depending on your internet connection

**Dependencies Installed:**
- React & React DOM (v18.2.0)
- React Router DOM (v6.20.1)
- Supabase JS Client (v2.38.4)
- Cornerstone Core & WADO Image Loader (DICOM viewing)
- Lucide React (icons)
- jsPDF (PDF generation)
- Vite (build tool)

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: Radiology-IS (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait for project to be provisioned (2-3 minutes)

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings → API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...`) - Keep this secret!

### Step 3: Run Database Setup Script

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file: `radiology-react/database/complete-database-setup.sql`
3. Copy the entire contents of the file
4. Paste into the SQL Editor
5. Click **"Run"** button

**What This Script Does:**
- Creates all database tables (users, patients, studies, reports)
- Sets up Row Level Security (RLS) policies
- Creates 3 test user accounts in Supabase Auth
- Inserts sample data for testing

**Expected Output:**
```
Success. No rows returned
```

**Verification Query:**
Run this query to verify setup:
```sql
SELECT email, user_type FROM users;
```

You should see 3 users:
- admin001@radiology.local (Administrator)
- rad001@radiology.local (Radiologist)
- tech001@radiology.local (Rad Tech)

### Step 4: Configure EmailJS (Optional but Recommended)

1. Go to https://dashboard.emailjs.com/
2. Create a new **Email Service** (Gmail, Outlook, etc.)
3. Create an **Email Template** with these variables:
   - `{{to_email}}` - Recipient email
   - `{{user_name}}` - User's full name
   - `{{user_id}}` - User ID for login
   - `{{password}}` - Temporary password
4. Go to **Account → Security**:
   - Enable **"Allow EmailJS API for non-browser applications"**
   - Enable **Private Key** and copy it
5. Note down:
   - Service ID (e.g., `service_xxxxx`)
   - Template ID (e.g., `template_xxxxx`)
   - Public Key (e.g., `cVx4MvMG...`)
   - Private Key (keep secret!)

---

## Configuration

### Step 1: Configure Supabase Connection

Edit `radiology-react/src/lib/supabase.js`:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'
```

Replace the placeholder values with your actual Supabase credentials from Step 2 of Database Setup.

### Step 2: Configure EmailJS (if using email notifications)

#### Option A: Using Supabase Secrets (Recommended for Production)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
npx supabase login
```

3. Link your project:
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

4. Set secrets:
```bash
npx supabase secrets set EMAILJS_SERVICE_ID=service_xxxxx
npx supabase secrets set EMAILJS_TEMPLATE_ID=template_xxxxx
npx supabase secrets set EMAILJS_PUBLIC_KEY=cVx4MvMG...
npx supabase secrets set EMAILJS_PRIVATE_KEY=your_private_key
```

5. Deploy the Edge Function:
```bash
npx supabase functions deploy send-account-email
```

#### Option B: Manual Configuration (Development Only)

Edit `supabase/functions/send-account-email/index.ts` and add your EmailJS credentials directly (not recommended for production).

---

## Running the Application

### Development Mode

```bash
# Make sure you're in the radiology-react directory
cd radiology-react

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v5.4.10  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:5173/`
3. You should see the login page

### First Login

Use one of the test accounts:

**Administrator:**
- Email: `admin001@radiology.local`
- Password: `admin123`

**Radiologist:**
- Email: `rad001@radiology.local`
- Password: `admin123`

**Rad Tech:**
- Email: `tech001@radiology.local`
- Password: `admin123`

---

## Deployment

### Build for Production

```bash
# Build the application
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deployment Options

#### Option 1: Netlify (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Follow the prompts:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option 2: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

#### Option 3: Traditional Web Server

1. Build the application: `npm run build`
2. Copy the contents of `dist/` folder to your web server
3. Configure your web server to serve the `index.html` for all routes (SPA routing)

**Example Nginx Configuration:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 2. "Invalid credentials" on login

**Cause:** Database not set up correctly or password hash mismatch

**Solution:**
- Re-run the database setup script in Supabase SQL Editor
- Make sure you copied the entire script

#### 3. "RLS policy violation" errors

**Cause:** Row Level Security policies not created

**Solution:**
- Re-run the database setup script
- Verify policies exist in Supabase Dashboard → Authentication → Policies

#### 4. DICOM images not loading

**Cause:** CORS issues or missing DICOM files

**Solution:**
- Check browser console for errors
- Verify DICOM files are uploaded correctly
- Check Supabase Storage bucket permissions

#### 5. Email notifications not working

**Cause:** EmailJS not configured or secrets not set

**Solution:**
- Verify EmailJS credentials in Supabase Secrets
- Check "Allow EmailJS API for non-browser applications" is enabled
- Verify Edge Function is deployed: `npx supabase functions list`

#### 6. Port 5173 already in use

**Solution:**
```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Checking Logs

**Supabase Logs:**
1. Go to Supabase Dashboard
2. Navigate to **Logs**
3. Check for errors in:
   - Database logs
   - Auth logs
   - Edge Function logs

**Browser Console:**
1. Press `F12` in your browser
2. Go to **Console** tab
3. Look for error messages

---

## Test Credentials

After installation, you can log in with these accounts:

| User Type | Email | User ID | Password | Permissions |
|-----------|-------|---------|----------|-------------|
| Administrator | admin001@radiology.local | ADMIN001 | admin123 | Full system access, user management |
| Radiologist | rad001@radiology.local | RAD001 | admin123 | View studies, create reports |
| Rad Tech | tech001@radiology.local | TECH001 | admin123 | Upload DICOM, schedule studies |

**Note:** Both email and User ID can be used for login.

**Security Reminder:** Change these default passwords in production!

---

## System Requirements

### Minimum Requirements
- **CPU**: Dual-core processor
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Internet**: Broadband connection (for Supabase)
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

### Recommended Requirements
- **CPU**: Quad-core processor
- **RAM**: 8 GB or more
- **Storage**: 2 GB free space
- **Internet**: High-speed broadband
- **Browser**: Latest version of Chrome, Firefox, or Edge

---

## Database Schema Overview

### Main Tables

1. **users** - System users with authentication
2. **patients** - Patient demographic information
3. **studies** - Radiology studies/exams
4. **reports** - Diagnostic reports linked to studies

### Key Relationships

- `studies.patient_uuid` → `patients.id`
- `reports.study_id` → `studies.study_id`
- `users.id` → `auth.users.id` (Supabase Auth)

---

## Security Considerations

1. **Never commit sensitive credentials** to version control
2. **Use environment variables** for production deployments
3. **Enable Row Level Security (RLS)** on all Supabase tables
4. **Change default passwords** immediately in production
5. **Use HTTPS** for all production deployments
6. **Keep dependencies updated** regularly
7. **Implement proper backup strategy** for database

---

## Support and Documentation

### Additional Documentation

- `COLLABORATOR-QUICK-START.md` - Quick setup for developers
- `FEATURES.md` - Complete feature list
- `docs/COMPLETE-SETUP-GUIDE.md` - Advanced setup options
- `docs/SYSTEM-OVERVIEW.md` - System architecture

### Getting Help

1. Check the troubleshooting section above
2. Review Supabase logs for errors
3. Check browser console for client-side errors
4. Consult the project documentation in the `docs/` folder

---

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update specific package
npm install <package-name>@latest
```

### Database Backups

1. Go to Supabase Dashboard → Database → Backups
2. Enable automatic backups
3. Download manual backups regularly

### Monitoring

- Monitor Supabase Dashboard for:
  - Database performance
  - API usage
  - Storage usage
  - Active users

---

## Estimated Installation Time

- **Prerequisites Setup**: 15-30 minutes
- **Database Configuration**: 10-15 minutes
- **Application Setup**: 5-10 minutes
- **Testing**: 10-15 minutes

**Total Time**: 40-70 minutes (first-time installation)

---

## Version Information

- **Application Version**: 1.0.0
- **Node.js**: v18+ required
- **React**: v18.2.0
- **Supabase JS**: v2.38.4
- **Vite**: v5.4.10

---

## License

[Add your license information here]

---

## Contact

[Add contact information for support]

---

**Installation Manual Version**: 1.0  
**Last Updated**: January 2026  
**Prepared for**: Radiology Information System Deployment
