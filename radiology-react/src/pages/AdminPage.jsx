import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const AdminPage = () => {
  useEffect(() => {
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }, [])

  return <Navigate to="/dashboard" replace />
}

export default AdminPage
