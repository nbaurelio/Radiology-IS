import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import AddPatient from './pages/AddPatient'
import Reports from './pages/Reports'
import AddReport from './pages/AddReport'
import ReportDetail from './pages/ReportDetail'
import UploadDicom from './pages/UploadDicom'
import StudyDetail from './pages/StudyDetail'
import Telehealth from './pages/Telehealth'
import AdminPage from './pages/AdminPage'
import NotificationTest from './pages/NotificationTest'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app-root">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/notifications-test" element={<NotificationTest />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/patients/add" element={<AddPatient />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/add" element={<AddReport />} />
                  <Route path="/reports/:id" element={<ReportDetail />} />
                  <Route path="/upload" element={<UploadDicom />} />
                  <Route path="/telehealth" element={<Telehealth />} />
                  <Route path="/studies/:id" element={<StudyDetail />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Routes>
            {/* Footer placed inside app-root so it sits above background layer */}
            <footer className="app-footer">
              <div className="app-footer-inner">
                <span>© {new Date().getFullYear()} XferDx — All rights reserved.</span>
              </div>
            </footer>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
