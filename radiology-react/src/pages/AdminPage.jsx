import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AlertCircle, Trash2, Users, FileText, Database, Eye, EyeOff } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*-_=+'
  
  const allChars = uppercase + lowercase + numbers + symbols
  
  let password = ''
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  password = password.split('').sort(() => Math.random() - 0.5).join('')
  
  return password
}

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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editUserData, setEditUserData] = useState(null)
  const { addNotification } = useNotifications()


  if (!user || (user.userType !== 'Hospital Admin')) {
    return <Navigate to="/dashboard" replace />
  }
  
  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId)
    setDeleteConfirmModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userToDelete)

      if (error) throw error

      showMessage('success', 'User deleted successfully')
      addNotification(createNotification({
        type: 'user_deleted',
        title: '🗑️ User Deleted',
        message: `User ${userToDelete} has been deleted from the system.`,
        priority: PRIORITY_LEVELS.ROUTINE,
        recipientRole: USER_ROLES.ADMIN,
        linkedEntity: { user_id: userToDelete },
        autoRemove: false
      }))
      await loadUsers()
    } catch (error) {
      console.error('Delete user error:', error)
      showMessage('error', `Failed to delete user: ${error.message}`)
    } finally {
      setLoading(false)
      setDeleteConfirmModal(false)
      setUserToDelete(null)
    }
  }

  const cancelDeleteUser = () => {
    setDeleteConfirmModal(false)
    setUserToDelete(null)
  }

  const handleUserClick = (account) => {
    setSelectedUser(account)
    setShowUserDetailModal(true)
    setIsEditingUser(false)
  }

  const handleEditUser = () => {
    setEditUserData({
      firstName: selectedUser.name.split(' ')[0],
      lastName: selectedUser.name.split(' ').slice(1).join(' '),
      email: selectedUser.email,
      employeeNumber: selectedUser.employeeNumber === 'N/A' ? '' : selectedUser.employeeNumber,
      role: selectedUser.role
    })
    setIsEditingUser(true)
  }

  const handleCancelEdit = () => {
    setIsEditingUser(false)
    setEditUserData(null)
  }

  const handleSaveUserEdit = async () => {
    setLoading(true)
    try {
      const userTypeId = editUserData.role === 'Hospital Admin' ? 1 :
                        editUserData.role === 'Radiologist' ? 2 : 3

      const { error } = await supabase
        .from('users')
        .update({
          first_name: editUserData.firstName,
          last_name: editUserData.lastName,
          email: editUserData.email,
          employee_number: editUserData.employeeNumber || null,
          user_type_id: userTypeId
        })
        .eq('user_id', selectedUser.userId)

      if (error) throw error

      showMessage('success', 'User information updated successfully')
      
      const changes = []
      const newFullName = `${editUserData.firstName} ${editUserData.lastName}`
      if (newFullName !== selectedUser.name) changes.push('name')
      if (editUserData.email !== selectedUser.email) changes.push('email')
      if (editUserData.role !== selectedUser.role) changes.push('role')
      if ((editUserData.employeeNumber || '') !== (selectedUser.employeeNumber || '')) changes.push('employee number')

      const changeText = changes.length ? `Updated: ${changes.join(', ')}` : 'Updated user details'
      addNotification(createNotification({
        type: 'user_edited',
        title: '✏️ User Updated',
        message: `${selectedUser.userId} — ${changeText}`,
        priority: PRIORITY_LEVELS.ROUTINE,
        recipientRole: USER_ROLES.ADMIN,
        linkedEntity: { user_id: selectedUser.userId },
        autoRemove: false
      }))
      
      await loadUsers()
      setIsEditingUser(false)
      setShowUserDetailModal(false)
      setEditUserData(null)
    } catch (error) {
      console.error('Update user error:', error)
      showMessage('error', `Failed to update user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

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
          user_type_id,
          employee_number,
          plain_password
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const userTypeMap = {
        1: 'Hospital Admin',
        2: 'Radiologist',
        3: 'Rad Tech'
      }

      const formattedUsers = data.map(user => ({
        userId: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        role: userTypeMap[user.user_type_id] || 'Unknown',
        email: user.email,
        employeeNumber: user.employee_number || 'N/A',
        password: user.plain_password || 'N/A',
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
    
    if (!userRole || !firstName || !lastName || !email || !employeeNumber) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    
    let createdAuthUserId = null
    
    try {
      // Map role to user_type_id
      const userTypeId = userRole === 'Hospital Admin' ? 1 :
                        userRole === 'Radiologist' ? 2 : 3
      
      // Generate user ID based on role
      const rolePrefix = userRole === 'Radiologist' ? 'RAD' :
                        userRole === 'Rad Tech' ? 'TECH' : 'ADMIN'
      
      // Get count of existing users with this role
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type_id', userTypeId)
      
      const userNumber = String((count || 0) + 1).padStart(3, '0')
      const userId = `${rolePrefix}${userNumber}`
      
      // Generate strong random password
      const password = `${rolePrefix.toLowerCase()}-${generateSecurePassword()}`
      
      const now = new Date().toISOString()
      
      // Auth email format: userid@radiology.local
      const authEmail = `${userId.toLowerCase()}@radiology.local`
      
      console.log('Creating auth user with email:', authEmail)
      
      // STEP 1: Create Supabase Auth user using ADMIN API (bypasses email verification)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          role: userRole
        }
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error(`User ID "${userId}" already exists. Please try again.`)
        }
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!authData.user) {
        throw new Error('Failed to create authentication user')
      }
      
      createdAuthUserId = authData.user.id
      console.log('Auth user created successfully:', createdAuthUserId)
      
      // STEP 2: Insert user into database with auth_user_id reference
      console.log('Creating database record for user:', userId)
      
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          email: email, // Use the actual email provided for contact
          first_name: firstName,
          last_name: lastName,
          password_hash: password,
          plain_password: password,
          user_type_id: userTypeId,
          is_active: true,
          employee_number: employeeNumber,
          created_at: now,
          updated_at: now,
          auth_user_id: authData.user.id // Link to Supabase Auth user
        })
        .select()
        .single()
      
      if (userError) {
        console.error('Database insert error:', userError)
        
        // Cleanup: Delete the auth user we just created
        try {
          await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId)
          console.log('Cleaned up auth user after database error')
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
        
        if (userError.code === '23505') {
          if (userError.message.includes('email')) {
            throw new Error(`The email "${email}" has already been registered. Please use a different email address.`)
          }
          if (userError.message.includes('user_id')) {
            throw new Error(`User ID "${userId}" already exists. Please try again.`)
          }
        }
        throw userError
      }
      
      console.log('User created successfully:', newUser)
      
      // Show success modal
      setNewUserCredentials({
        userId,
        name: `${firstName} ${lastName}`,
        authEmail: authEmail, // Login email
        contactEmail: email, // Contact email
        password
      })
      setShowSuccessModal(true)
      setShowAddAccountModal(false)
      
      await loadUsers()
      
      // Reset form
      setUserRole('')
      setFirstName('')
      setLastName('')
      setEmail('')
      setEmployeeNumber('')
      
      addNotification(createNotification({
        type: 'user_created',
        title: '✅ Account Created',
        message: `Account ${userId} (${firstName} ${lastName}) was created successfully.`,
        priority: PRIORITY_LEVELS.ROUTINE,
        recipientRole: USER_ROLES.ADMIN,
        linkedEntity: { user_id: userId },
        actionLink: `/admin`,
        autoRemove: false
      }))
    } catch (error) {
      console.error('Generate account error:', error)
      let userFriendlyMessage = error.message || 'Failed to create account'
      
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
        .neq('id', user.id)
      
      if (error) throw error
      
      showMessage('success', 'All users deleted successfully (except your account)')
      await loadUsers()
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
      const { data: reports, error: fetchError } = await supabase
        .from('reports')
        .select('*')
      
      if (fetchError) throw fetchError
      
      if (reports && reports.length > 0) {
        for (const report of reports) {
          await supabase.from('reports').delete().eq('id', report.id)
        }
        showMessage('success', `Deleted ${reports.length} report(s) successfully`)
        setTimeout(() => window.location.reload(), 1000)
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
      const { count: reportCount, error: reportError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
      
      if (reportError) throw reportError
      
      if (reportCount > 0) {
        showMessage('error', `Cannot delete patients. There are ${reportCount} report(s). Delete reports first.`)
        setLoading(false)
        return
      }
      
      const { count: studyCount, error: studyError } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
      
      if (studyError) throw studyError
      
      if (studyCount > 0) {
        showMessage('error', `Cannot delete patients. There are ${studyCount} studies. Delete studies first.`)
        setLoading(false)
        return
      }
      
      setLoading(false)
      
      const confirmation = window.prompt(
        'WARNING: This will delete ALL patients!\n\nType "CONFIRM-DELETE" to confirm:'
      )
      
      if (confirmation !== 'CONFIRM-DELETE') {
        showMessage('error', 'Deletion cancelled')
        return
      }

      setLoading(true)
      
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
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: '300px',
          padding: '14px 20px',
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <AlertCircle size={20} color={message.type === 'success' ? '#059669' : '#dc2626'} />
          <span style={{
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            fontSize: '14px',
            fontWeight: '500'
          }}>{message.text}</span>
        </div>
      )}

      <article className="card table-card">
        <div className="hd">Account Management</div>
        <div className="bd" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search users..."
              style={{ flex: '1' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setShowAddAccountModal(true)}
              className="btn-primary" 
              style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}
            >
              Add Account
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
                  <th>Employee #</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {generatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                      No accounts yet. Click "Add Account" to create users.
                    </td>
                  </tr>
                ) : (
                  generatedAccounts
                    .filter(account => {
                      if (!searchTerm) return true
                      const search = searchTerm.toLowerCase()
                      return (
                        account.name.toLowerCase().includes(search) ||
                        account.email.toLowerCase().includes(search) ||
                        account.role.toLowerCase().includes(search) ||
                        account.userId.toLowerCase().includes(search)
                      )
                    })
                    .map((account, index) => (
                    <tr key={index} onClick={() => handleUserClick(account)} style={{cursor: 'pointer'}}>
                      <td>{account.userId}</td>
                      <td>{account.name}</td>
                      <td>{account.role}</td>
                      <td>{account.email}</td>
                      <td>{account.employeeNumber || 'N/A'}</td>
                      <td><span className="badge badge-done">{account.status}</span></td>
                      <td>{account.created}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(account.userId)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <article className="card table-card">
        <div className="hd">
          Danger Zone
          <small style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '12px' }}>
            Irreversible actions - use with caution
          </small>
        </div>

        <div className="admin-actions">
          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#ef4444' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Users</h3>
                <p>Remove all users (except your account)</p>
              </div>
            </div>
            <button onClick={handleDeleteAllUsers} disabled={loading} className="btn-danger">
              <Trash2 size={16} />
              DELETE USERS
            </button>
          </div>

          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#f59e0b' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Patients</h3>
                <p>Remove all patient records</p>
              </div>
            </div>
            <button onClick={handleDeleteAllPatients} disabled={loading} className="btn-danger">
              <Trash2 size={16} />
              DELETE PATIENTS
            </button>
          </div>

          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#8b5cf6' }}>
                <Database size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Studies</h3>
                <p>Remove all DICOM studies</p>
              </div>
            </div>
            <button onClick={handleDeleteAllStudies} disabled={loading} className="btn-danger">
              <Trash2 size={16} />
              DELETE STUDIES
            </button>
          </div>

          <div className="admin-action-item">
            <div className="admin-action-info">
              <div className="admin-action-icon" style={{ background: '#06b6d4' }}>
                <FileText size={24} color="white" />
              </div>
              <div>
                <h3>Delete All Reports</h3>
                <p>Remove all radiology reports</p>
              </div>
            </div>
            <button onClick={handleDeleteAllReports} disabled={loading} className="btn-danger">
              <Trash2 size={16} />
              DELETE REPORTS
            </button>
          </div>
        </div>
      </article>

      {showSuccessModal && newUserCredentials && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Account Created!</h2>
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
                  <p style={{margin: '4px 0'}}><strong>User ID (for login):</strong> {newUserCredentials.userId}</p>
                  <p style={{margin: '4px 0'}}><strong>Name:</strong> {newUserCredentials.name}</p>
                  <p style={{margin: '4px 0'}}><strong>Contact Email:</strong> {newUserCredentials.contactEmail}</p>
                  <p style={{margin: '4px 0'}}><strong>Password:</strong> <code style={{background: '#fff', padding: '2px 8px', borderRadius: '4px'}}>{newUserCredentials.password}</code></p>
                </div>
              </div>
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
                <p style={{margin: '0', fontSize: '14px', color: '#991b1b', textAlign: 'center'}}>
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

      {showAddAccountModal && (
  <div className="modal" style={{display: 'flex', padding: '120px 20px 40px'}}>
    <div className="modal-content" style={{maxWidth: '550px', margin: 'auto'}}>
      <div className="modal-header">
        <div>
          <h2>Add New Account</h2>
          <p className="modal-subtitle">Create a new user account</p>
        </div>
        <button className="close-btn" onClick={() => {
          setShowAddAccountModal(false)
          setUserRole('')
          setFirstName('')
          setLastName('')
          setEmail('')
          setEmployeeNumber('')
        }}>&times;</button>
      </div>
      <div className="modal-body" style={{padding: '20px'}}>
        <form onSubmit={handleGenerateAccount}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                User Role <span style={{color: 'var(--error)'}}>*</span>
              </label>
              <select 
                className="form-select" 
                style={{width: '100%'}}
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="Hospital Admin">Administrator</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Rad Tech">Rad Tech</option>
              </select>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                  First Name <span style={{color: 'var(--error)'}}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="First Name"
                  style={{width: '100%'}}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                  Last Name <span style={{color: 'var(--error)'}}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Last Name"
                  style={{width: '100%'}}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                Email Address <span style={{color: 'var(--error)'}}>*</span>
              </label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@example.com"
                style={{width: '100%'}}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                Employee Number <span style={{color: 'var(--error)'}}>*</span>
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="12345"
                style={{width: '100%'}}
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
          </div>

          <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
            <button 
              type="button"
              onClick={() => {
                setShowAddAccountModal(false)
                setUserRole('')
                setFirstName('')
                setLastName('')
                setEmail('')
                setEmployeeNumber('')
              }}
              style={{
                padding: '10px 20px',
                border: '1px solid var(--line)',
                background: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'var(--brand)',
                color: 'white',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {deleteConfirmModal && (
        <div className="modal" style={{display: 'flex', padding: '150px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '450px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Delete User</h2>
              </div>
              <button className="close-btn" onClick={cancelDeleteUser}>&times;</button>
            </div>
            <div className="modal-body" style={{padding: '20px'}}>
              <p style={{margin: '0 0 20px 0', fontSize: '14px'}}>
                Are you sure you want to delete this user?
              </p>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                <button 
                  onClick={cancelDeleteUser}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid var(--line)',
                    background: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteUser}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserDetailModal && selectedUser && (
        <div className="modal" style={{display: 'flex', padding: '120px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '600px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>User Details</h2>
              </div>
              <button className="close-btn" onClick={() => {
                setShowUserDetailModal(false)
                setShowPassword(false)
              }}>&times;</button>
            </div>
            <div className="modal-body" style={{padding: '24px'}}>
              {!isEditingUser ? (
                <>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <tbody>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, width: '35%'}}>User ID</td>
                      <td style={{padding: '12px'}}>{selectedUser.userId}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Name</td>
                      <td style={{padding: '12px'}}>{selectedUser.name}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Role</td>
                      <td style={{padding: '12px'}}>{selectedUser.role}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Email</td>
                      <td style={{padding: '12px'}}>{selectedUser.email}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Employee #</td>
                      <td style={{padding: '12px'}}>{selectedUser.employeeNumber}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Password</td>
                      <td style={{padding: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <code style={{background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', flex: 1}}>
                            {showPassword ? selectedUser.password : '••••••••'}
                          </code>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{padding: '12px', fontWeight: 600}}>Status</td>
                      <td style={{padding: '12px'}}>
                        <span className="badge badge-done">{selectedUser.status}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{marginTop: '24px', display: 'flex', justifyContent: 'space-between'}}>
                  <button 
                    onClick={handleEditUser}
                    style={{
                      padding: '10px 24px',
                      border: '1px solid var(--brand)',
                      background: 'white',
                      color: 'var(--brand)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserDetailModal(false)
                      setShowPassword(false)
                    }}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      background: 'var(--brand)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Close
                  </button>
                </div>
                </>
              ) : (
                <div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500'}}>
                          First Name
                        </label>
                        <input 
                          type="text"
                          value={editUserData.firstName}
                          onChange={(e) => setEditUserData({...editUserData, firstName: e.target.value})}
                          style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500'}}>
                          Last Name
                        </label>
                        <input 
                          type="text"
                          value={editUserData.lastName}
                          onChange={(e) => setEditUserData({...editUserData, lastName: e.target.value})}
                          style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px'}}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500'}}>
                        Role
                      </label>
                      <select 
                        value={editUserData.role}
                        onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px'}}
                      >
                        <option value="Hospital Admin">Administrator</option>
                        <option value="Radiologist">Radiologist</option>
                        <option value="Rad Tech">Rad Tech</option>
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500'}}>
                        Email
                      </label>
                      <input 
                        type="email"
                        value={editUserData.email}
                        onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500'}}>
                        Employee Number
                      </label>
                      <input 
                        type="text"
                        value={editUserData.employeeNumber}
                        onChange={(e) => setEditUserData({...editUserData, employeeNumber: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px'}}
                      />
                    </div>
                  </div>

                  <div style={{marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={handleCancelEdit}
                      style={{
                        padding: '10px 20px',
                        border: '1px solid var(--line)',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveUserEdit}
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: 'var(--brand)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPage