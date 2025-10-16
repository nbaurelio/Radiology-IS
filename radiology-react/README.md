# Radiology Information System - React Version

A modern React-based radiology information system migrated from vanilla JavaScript/HTML/CSS. This application provides comprehensive patient management, study tracking, and reporting capabilities for medical imaging facilities.

## Features

- **Authentication System**: Secure login with Supabase Auth
- **Dashboard**: Real-time metrics and recent studies overview
- **Patient Management**: Complete CRUD operations for patient records
- **Study Management**: DICOM upload and study tracking
- **Reports Management**: Radiology report creation and management
- **Modern UI**: Built with React, TailwindCSS, and Lucide icons
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18, JavaScript (ES6+)
- **Routing**: React Router DOM
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Authentication)
- **Build Tool**: Vite
- **Package Manager**: npm

## Prerequisites

Before running this application, make sure you have:

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- A Supabase project with the required database tables

## Installation

1. **Install Node.js**:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Install Dependencies**:
   ```bash
   cd radiology-react
   npm install
   ```

3. **Configure Supabase**:
   - The Supabase configuration is already set up in `src/lib/supabase.js`
   - Make sure your Supabase project has the required database tables:
     - `users` (with user_types relationship)
     - `patients`
     - `studies`
     - `reports`
     - `user_types`

## Running the Application

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   This will start the development server at `http://localhost:3000`

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Default Login Credentials

- **Admin**: ADMIN001 / admin123
- **Radiologist**: RAD001 / admin123  
- **Rad Tech**: TECH001 / admin123

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx      # Navigation header
│   ├── Layout.jsx      # Main layout wrapper
│   └── ProtectedRoute.jsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/               # Utilities and configurations
│   └── supabase.js    # Supabase client setup
├── pages/             # Page components
│   ├── Login.jsx      # Login page
│   ├── Dashboard.jsx  # Main dashboard
│   ├── Patients.jsx   # Patient list
│   ├── AddPatient.jsx # Add patient form
│   ├── PatientDetail.jsx # Patient details
│   ├── Reports.jsx    # Reports list
│   ├── AddReport.jsx  # Add report form
│   ├── ReportDetail.jsx # Report details
│   ├── UploadDicom.jsx # DICOM upload
│   └── StudyDetail.jsx # Study details
├── services/          # API service functions
│   ├── patientService.js # Patient operations
│   ├── studyService.js   # Study operations
│   └── reportService.js  # Report operations
├── App.jsx            # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## Key Features Implemented

### ✅ Completed
- React project setup with Vite
- Authentication system with Supabase
- Protected routes
- Modern UI with TailwindCSS
- Dashboard with real-time stats
- Patient management (list, add, detail)
- Reports management (list, add)
- DICOM upload interface
- Dark/light theme toggle
- Responsive design

### 🚧 In Progress / Coming Soon
- Report detail view with editing
- Study detail viewer
- DICOM file processing
- Advanced search and filtering
- User management
- Notifications system

## Differences from Original

This React version provides several improvements over the original vanilla JS version:

1. **Component-based Architecture**: Reusable, maintainable components
2. **Modern State Management**: React hooks and context
3. **Better Routing**: Client-side routing with React Router
4. **Improved UI**: Modern design with TailwindCSS
5. **Better Developer Experience**: Hot reload, TypeScript support ready
6. **Scalability**: Easier to add new features and maintain

## Troubleshooting

1. **Node.js not found**: Make sure Node.js is installed and added to PATH
2. **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
3. **Supabase errors**: Check your internet connection and Supabase project status
4. **Build errors**: Make sure all dependencies are installed correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues or need help:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Make sure all dependencies are installed
4. Check that your database tables are set up correctly

## License

This project is part of the Radiology Information System and follows the same licensing as the original project.
