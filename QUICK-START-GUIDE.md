# Quick Start Guide - Running the Website Locally

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Web Browser**
   - Chrome, Firefox, or Edge (latest version)

---

## Installation Steps

### Step 1: Navigate to Project Directory

```bash
# Open terminal/command prompt
# Navigate to the project folder
cd path/to/Radiology-IS/radiology-react
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

**Expected Output:**
- npm will download and install all packages
- This takes 2-5 minutes depending on your internet connection
- You'll see a progress bar and package names being installed

### Step 3: Start the Development Server

```bash
# Run the development server
npm run dev
```

**Expected Output:**
```
VITE v5.4.10  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open in Browser

1. Open your web browser
2. Go to: `http://localhost:5173/`
3. You should see the login page

---

## Default Login Credentials

Use these accounts to test the application:

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

## Stopping the Server

Press `Ctrl + C` in the terminal to stop the development server.

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Use a different port
npm run dev -- --port 3000
```

Then access at: `http://localhost:3000/`

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

---

## That's It!

**Total Time:** 5-10 minutes

The website should now be running locally on your machine. All features will work as the application connects to the existing Supabase backend.
