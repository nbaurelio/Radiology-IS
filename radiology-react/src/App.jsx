import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
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
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
