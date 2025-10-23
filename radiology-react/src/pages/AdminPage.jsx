import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, Trash2, Users, FileText, Database } from 'lucide-react'

const AdminPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [userRole, setUserRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [generatedAccounts, setGeneratedAccounts] = useState([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newUserCredentials, setNewUserCredentials] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Redirect if not admin
  if (!user || (user.userType !== 'Hospital Admin' && user.userType !== 'Administrator')) {
    return <Navigate to="/dashboard" replace />
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Load existing users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          user_id,
          first_name,
          last_name,
          email,
          is_active,
          created_at,
          user_type_id
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map user_type_id to role name
      const userTypeMap = {
        1: 'Administrator',
        2: 'Radiologist',
        3: 'Rad Tech'
      }

      const formattedUsers = data.map(user => ({
        userId: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        role: userTypeMap[user.user_type_id] || 'Unknown',
        email: user.email,
        password: '••••••••',
        status: user.is_active ? 'Active' : 'Inactive',
        created: new Date(user.created_at).toLocaleDateString()
      }))

      setGeneratedAccounts(formattedUsers)
    } catch (error) {
      console.error('Load users error:', error)
    }
  }

  const handleGenerateAccount = async (e) => {
    e.preventDefault()
    
    if (!userRole || !firstName || !lastName || !email) {
      showMessage('error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // Map role to user_type_id
      const userTypeId = userRole === 'Administrator' ? 1 :
                        userRole === 'Radiologist' ? 2 : 3
      
      // Generate user ID based on role
      const rolePrefix = userRole === 'Radiologist' ? 'RAD' :
                        userRole === 'Rad Tech' ? 'TECH' : 'ADMIN'
      
      // Get count of existing users with this role to generate next ID
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type_id', userTypeId)
      
      const userNumber = String((count || 0) + 1).padStart(3, '0')
      const userId = `${rolePrefix}${userNumber}`
      
      // Generate random password with role prefix
      const generateRandomPassword = (rolePrefix) => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let randomStr = ''
        for (let i = 0; i < 12; i++) {
          randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return `${rolePrefix}-${randomStr}`
      }
      
      const password = generateRandomPassword(rolePrefix)
      
      // For now, we'll use a placeholder hash since we can't generate SHA-256 in browser without crypto library
      const passwordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            user_id: userId,
            user_type: userRole,
            first_name: firstName,
            last_name: lastName
          }
        }
      })
      
      if (authError) throw authError
      
      // Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          user_id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          password_hash: passwordHash,
          user_type_id: userTypeId,
          is_active: true
        })
      
      if (userError) throw userError
      
      // Show success modal with credentials
      setNewUserCredentials({
        userId,
        name: `${firstName} ${lastName}`,
        email,
        password
      })
      setShowSuccessModal(true)
      
      // Reload users list
      await loadUsers()
      
      // Reset form
      setUserRole('')
      setFirstName('')
      setLastName('')
      setEmail('')
    } catch (error) {
      console.error('Generate account error:', error)
      
      // Check for specific error types
      let userFriendlyMessage = error.message
      
      // Check for duplicate/already registered email
      if (error.message.includes('duplicate') || 
          error.message.includes('already exists') ||
          error.message.includes('already registered') ||
          error.message.includes('User already registered') ||
          error.code === '23505') {
        userFriendlyMessage = `The email "${email}" has already been registered. Please use a different email address.`
      } 
      // Check for invalid email format
      else if (error.message.includes('invalid email') || error.message.includes('badly formatted')) {
        userFriendlyMessage = `The email address "${email}" is invalid. Please check the format and try again.`
      }
      // Generic error
      else {
        userFriendlyMessage = `Failed to create account: ${error.message}`
      }
      
      setErrorMessage(userFriendlyMessage)
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handleGenerateAccount} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select 
              className="form-select" 
              style={{ flex: '1', minWidth: '200px' }}
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              required
            >
              <option value="">Select User Role</option>
              <option value="Radiologist">Radiologist</option>
              <option value="Rad Tech">Rad Tech</option>
              <option value="Hospital Admin">Hospital Admin</option>
            </select>
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="First Name"
              style={{ flex: '1', minWidth: '150px' }}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="Last Name"
              style={{ flex: '1', minWidth: '150px' }}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            
            <input 
              type="email" 
              className="form-input" 
              placeholder="Email Address"
              style={{ flex: '1', minWidth: '200px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <button 
              type="submit"
              className="btn-primary" 
              disabled={loading}
              style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}
            >
              {loading ? 'Generating...' : 'Generate Account'}
            </button>
          </form>
          
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
                {generatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                      No accounts generated yet. Use the form above to create new user accounts.
                    </td>
                  </tr>
                ) : (
                  generatedAccounts.map((account, index) => (
                    <tr key={index}>
                      <td>{account.userId}</td>
                      <td>{account.name}</td>
                      <td>{account.role}</td>
                      <td>{account.email}</td>
                      <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{account.password}</code></td>
                      <td><span className="badge badge-done">{account.status}</span></td>
                      <td>{account.created}</td>
                    </tr>
                  ))
                )}
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

      {/* Success Modal */}
      {showSuccessModal && newUserCredentials && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Account Created Successfully!</h2>
              </div>
              <button className="close-btn" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#065f46'}}>
                  <strong>Save these credentials:</strong>
                </p>
                <div style={{fontSize: '14px', color: '#047857', lineHeight: '1.8'}}>
                  <p style={{margin: '4px 0'}}><strong>User ID:</strong> {newUserCredentials.userId}</p>
                  <p style={{margin: '4px 0'}}><strong>Name:</strong> {newUserCredentials.name}</p>
                  <p style={{margin: '4px 0'}}><strong>Email:</strong> {newUserCredentials.email}</p>
                  <p style={{margin: '4px 0'}}><strong>Password:</strong> <code style={{background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #6ee7b7'}}>{newUserCredentials.password}</code></p>
                </div>
              </div>
              <p style={{fontSize: '13px', color: 'var(--muted)', marginBottom: '20px'}}>
                Please save these credentials. The password will not be shown again.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--brand)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Failed to Create Account</h2>
              </div>
              <button className="close-btn" onClick={() => setShowErrorModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{margin: '0', fontSize: '14px', color: '#991b1b', lineHeight: '1.6', textAlign: 'center'}}>
                  {errorMessage}
                </p>
              </div>
              <button 
                onClick={() => setShowErrorModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPage
