# Radiology IS Documentation

This folder contains all documentation and guides for the Radiology Information System.

## 📚 Documentation Files

### Setup & Configuration
- **`COMPLETE-SETUP-GUIDE.md`** - Complete guide for setting up Supabase Authentication
- **`NEXT-APPOINTMENT-FEATURE-GUIDE.md`** - Guide for the Next Appointment feature
- **`PATIENTS-TABLE-UPDATE-SUMMARY.md`** - Summary of patients table styling updates
- **`TABLE-COLUMN-UPDATE-SUMMARY.md`** - Summary of table column structure changes

## 🗂️ Project Structure

```
Radiology-IS/
├── docs/                          # Documentation files (you are here)
├── main/
│   ├── AdminPage/                 # Admin dashboard page
│   ├── Dashboard/                 # Main dashboard
│   ├── Login/                     # Login page
│   ├── Patients/                  # Patients management
│   ├── database/                  # SQL scripts and migrations
│   └── shared/                    # Shared resources (CSS, JS, config)
└── .gitattributes
```

## 🔧 Database Scripts

All SQL scripts are located in `main/database/`:
- Migration scripts
- RLS policy updates
- User setup scripts

## 🎨 Styling

Shared styles are in `main/shared/`:
- `common.css` - Global styles and theme variables
- `theme-toggle.js` - Dark/light mode toggle

## 🔐 Authentication

The project uses Supabase Authentication with custom user management.
See `COMPLETE-SETUP-GUIDE.md` for setup instructions.

## 📝 Notes

- All documentation is written in Markdown
- SQL scripts should be run in Supabase SQL Editor
- Configuration files are in `main/shared/`
