import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, Trash2, Users, FileText, Database } from 'lucide-react'

const AdminPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Redirect if not admin
  if (!user || (user.userType !== 'Hospital Admin' && user.userType !== 'Administrator')) {
    return <Navigate to="/dashboard" replace />
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleDeleteAllUsers = async () => {
    const confirmation = window.prompt(
      'WARNING: This will delete ALL users from the database!\n\nType "CONFIRM-DELETE" to confirm:'
    )
    
    if (confirmation !== 'CONFIRM-DELETE') {
      showMessage('error', 'Deletion cancelled or incorrect confirmation text')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .neq('id', user.id) // Don't delete current user
      
      if (error) throw error
      
      showMessage('success', 'All users deleted successfully (except your account)')
    } catch (error) {
      console.error('Delete users error:', error)
      showMessage('error', `Failed to delete users: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllStudies = async () => {
    const confirmation = window.prompt(
      'WARNING: This will delete ALL studies from the database!\n\nType "CONFIRM-DELETE" to confirm:'
    )
    
    if (confirmation !== 'CONFIRM-DELETE') {
      showMessage('error', 'Deletion cancelled or incorrect confirmation text')
      return
    }

    setLoading(true)
    try {
      // Get all study IDs first
      const { data: studies, error: fetchError } = await supabase
        .from('studies')
        .select('id')
      
      if (fetchError) throw fetchError
      
      if (studies && studies.length > 0) {
        const { error: deleteError } = await supabase
          .from('studies')
          .delete()
          .in('id', studies.map(s => s.id))
        
        if (deleteError) throw deleteError
      }
      
      showMessage('success', 'All studies deleted successfully')
    } catch (error) {
      console.error('Delete studies error:', error)
      showMessage('error', `Failed to delete studies: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllReports = async () => {
    const confirmation = window.prompt(
      'WARNING: This will delete ALL reports from the database!\n\nType "CONFIRM-DELETE" to confirm:'
    )
    
    if (confirmation !== 'CONFIRM-DELETE') {
      showMessage('error', 'Deletion cancelled or incorrect confirmation text')
      return
    }

    setLoading(true)
    try {
      // Get all reports
      const { data: reports, error: fetchError } = await supabase
        .from('reports')
        .select('*')
      
      console.log('Reports found:', reports)
      
      if (fetchError) throw fetchError
      
      if (reports && reports.length > 0) {
        // Delete each report individually to bypass RLS issues
        let deletedCount = 0
        let errors = []
        
        for (const report of reports) {
          const { error: deleteError } = await supabase
            .from('reports')
            .delete()
            .eq('id', report.id)
          
          if (deleteError) {
            console.error(`Failed to delete report ${report.id}:`, deleteError)
            errors.push(deleteError.message)
          } else {
            deletedCount++
          }
        }
        
        if (errors.length > 0) {
          showMessage('error', `Deleted ${deletedCount} reports, but ${errors.length} failed. Check console for details.`)
        } else {
          showMessage('success', `Deleted ${deletedCount} report(s) successfully`)
          
          // Reload page after 1 second to show updated data
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        showMessage('success', 'No reports to delete')
      }
    } catch (error) {
      console.error('Delete reports error:', error)
      showMessage('error', `Failed to delete reports: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllPatients = async () => {
    setLoading(true)
    try {
      // Check if there are any reports
      const { count: reportCount, error: reportError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
      
      if (reportError) throw reportError
      
      if (reportCount > 0) {
        showMessage('error', `Cannot delete patients. There are ${reportCount} report(s) in the database. Delete all reports first.`)
        setLoading(false)
        return
      }
      
      // Check if there are any studies
      const { count: studyCount, error: studyError } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
      
      if (studyError) throw studyError
      
      if (studyCount > 0) {
        showMessage('error', `Cannot delete patients. There are ${studyCount} study/studies in the database. Delete all studies first.`)
        setLoading(false)
        return
      }
      
      // If no reports or studies, proceed with confirmation
      setLoading(false)
      
      const confirmation = window.prompt(
        'WARNING: This will delete ALL patients from the database!\n\nType "CONFIRM-DELETE" to confirm:'
      )
      
      if (confirmation !== 'CONFIRM-DELETE') {
        showMessage('error', 'Deletion cancelled or incorrect confirmation text')
        return
      }

      setLoading(true)
      
      // Get all patient IDs
      const { data: patients, error: fetchError } = await supabase
        .from('patients')
        .select('id')
      
      if (fetchError) throw fetchError
      
      if (patients && patients.length > 0) {
        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .in('id', patients.map(p => p.id))
        
        if (deleteError) throw deleteError
      }
      
      showMessage('success', 'All patients deleted successfully')
    } catch (error) {
      console.error('Delete patients error:', error)
      showMessage('error', `Failed to delete patients: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid">
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Generation Section */}
      <article className="card table-card">
        <div className="hd">Account Generation</div>
        <div className="bd" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select 
              className="form-select" 
              style={{ flex: '1', minWidth: '200px' }}
              disabled
            >
              <option>Select User Role</option>
              <option>Radiologist</option>
              <option>Rad Tech</option>
              <option>Hospital Admin</option>
            </select>
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="First Name"
              style={{ flex: '1', minWidth: '150px' }}
              disabled
            />
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="Last Name"
              style={{ flex: '1', minWidth: '150px' }}
              disabled
            />
            
            <input 
              type="email" 
              className="form-input" 
              placeholder="Email Address"
              style={{ flex: '1', minWidth: '200px' }}
              disabled
            />
            
            <button 
              className="btn-primary" 
              disabled
              style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}
            >
              Generate Account
            </button>
          </div>
          
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    No accounts generated yet. Use the form above to create new user accounts.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      {/* Danger Zone Section */}
      <article className="card table-card">
        <div className="hd">
          Danger Zone
          <small style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '12px' }}>
            These actions are irreversible. Use with extreme caution.
          </small>
        </div>

        <div className="admin-actions">
          {/* Delete All Users */}
          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#ef4444' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Users</h3>
                <p>Remove all users from the database (except your account)</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAllUsers}
              disabled={loading}
              className="btn-danger"
            >
              <Trash2 size={16} />
              DELETE USERS
            </button>
          </div>

          {/* Delete All Patients */}
          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#f59e0b' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Patients</h3>
                <p>Remove all patient records from the database</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAllPatients}
              disabled={loading}
              className="btn-danger"
            >
              <Trash2 size={16} />
              DELETE PATIENTS
            </button>
          </div>

          {/* Delete All Studies */}
          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#8b5cf6' }}>
                <Database size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Studies</h3>
                <p>Remove all DICOM studies from the database</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAllStudies}
              disabled={loading}
              className="btn-danger"
            >
              <Trash2 size={16} />
              DELETE STUDIES
            </button>
          </div>

          {/* Delete All Reports */}
          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#06b6d4' }}>
                <FileText size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Reports</h3>
                <p>Remove all radiology reports from the database</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAllReports}
              disabled={loading}
              className="btn-danger"
            >
              <Trash2 size={16} />
              DELETE REPORTS
            </button>
          </div>
        </div>
      </article>
    </section>
  )
}

export default AdminPage
