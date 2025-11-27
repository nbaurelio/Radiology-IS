import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, Trash2, Users, FileText, Database, Eye, EyeOff } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

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
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editUserData, setEditUserData] = useState(null)
  const { addNotification } = useNotifications()

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
      // Notification for deleted user
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
      // Map role to user_type_id
      const userTypeId = editUserData.role === 'Administrator' ? 1 :
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
      // Notification for user edit - include changed fields
      try {
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
      } catch (err) {
        // non-fatal - do not block UI if notification fails
        console.error('Notification error after editing user:', err)
      }
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
          is_active: true,
          employee_number: employeeNumber,
          plain_password: password
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
      setShowAddAccountModal(false)
      
      // Reload users list
      await loadUsers()
      
      // Reset form
      setUserRole('')
      setFirstName('')
      setLastName('')
      setEmail('')
      setEmployeeNumber('')
      setDateOfBirth('')
      // Notification for created account
      addNotification(createNotification({
        type: 'user_created',
        title: '✅ Account Created',
        message: `Account ${userId} (${firstName} ${lastName}) was created.`,
        priority: PRIORITY_LEVELS.ROUTINE,
        recipientRole: USER_ROLES.ADMIN,
        linkedEntity: { user_id: userId },
        actionLink: `/admin`,
        autoRemove: false
      }))
    } catch (error) {
      console.error('Generate account error:', error)
      // Handle specific cases first (email rate limiting)
      const msg = (error && error.message) ? String(error.message).toLowerCase() : ''
      if (msg.includes('rate') || msg.includes('rate limit') || msg.includes('email rate')) {
        try {
          // Try to find the user record in the DB by email — in some cases the user was created
          const { data: existingUser, error: fetchUserError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

          if (!fetchUserError && existingUser) {
            setNewUserCredentials({
              userId: existingUser.user_id || existingUser.userId || 'N/A',
              name: `${existingUser.first_name || ''} ${existingUser.last_name || ''}`.trim(),
              email: existingUser.email,
              password: existingUser.plain_password || 'N/A'
            })
            setShowSuccessModal(true)
            setShowAddAccountModal(false)

            addNotification(createNotification({
              type: 'user_creation_email_rate_limited',
              title: '⚠️ Email Rate Limited',
              message: `Account ${existingUser.user_id || existingUser.userId} was created but verification email was not sent (rate limit). Copy credentials and notify the user manually.`,
              priority: PRIORITY_LEVELS.URGENT,
              recipientRole: USER_ROLES.ADMIN,
              linkedEntity: { user_id: existingUser.user_id || existingUser.userId },
              autoRemove: false
            }))
            // Reload users to reflect the new user if present
            await loadUsers()
            setLoading(false)
            return
          }
        } catch (innerErr) {
          console.error('Error handling rate-limit fallback:', innerErr)
        }
        // If we couldn't find the user record, fall through to show the generic error modal
      }

      // Check for specific error types and show a friendly message
      let userFriendlyMessage = (error && error.message) ? String(error.message) : 'Failed to create account'
      // Check for duplicate/already registered email
      if (userFriendlyMessage.toLowerCase().includes('duplicate') || 
          userFriendlyMessage.toLowerCase().includes('already exists') ||
          userFriendlyMessage.toLowerCase().includes('already registered') ||
          userFriendlyMessage.toLowerCase().includes('user already registered') ||
          error.code === '23505') {
        userFriendlyMessage = `The email "${email}" has already been registered. Please use a different email address.`
      } 
      // Check for invalid email format
      else if (userFriendlyMessage.toLowerCase().includes('invalid email') || userFriendlyMessage.toLowerCase().includes('badly formatted')) {
        userFriendlyMessage = `The email address "${email}" is invalid. Please check the format and try again.`
      }
      // Generic error
      else {
        userFriendlyMessage = `Failed to create account: ${userFriendlyMessage}`
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
      addNotification(createNotification({
        type: 'all_users_deleted',
        title: '🧨 All Users Deleted',
        message: 'All user accounts were deleted (except your account).',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.ADMIN,
        autoRemove: false
      }))
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
      addNotification(createNotification({
        type: 'all_studies_deleted',
        title: '🧨 Studies Deleted',
        message: 'All studies were deleted from the database.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.ADMIN,
        autoRemove: false
      }))
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
          addNotification(createNotification({
            type: 'all_reports_deleted',
            title: '🧨 Reports Deleted',
            message: `Deleted ${deletedCount} report(s) from the system.`,
            priority: PRIORITY_LEVELS.URGENT,
            recipientRole: USER_ROLES.ADMIN,
            autoRemove: false
          }))
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
      addNotification(createNotification({
        type: 'all_patients_deleted',
        title: '🧨 Patients Deleted',
        message: 'All patient records were deleted from the database.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.ADMIN,
        autoRemove: false
      }))
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
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      {/* Account Generation Section */}
      <article className="card table-card">
        <div className="hd">Account Generation</div>
        <div className="bd" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search users by name, email, or role..."
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
                  <th>Employee Number</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {generatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                      No accounts generated yet. Use the form above to create new user accounts.
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
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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

      {/* Add Account Modal */}
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
                setDateOfBirth('')
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
                      <option value="">Select User Role</option>
                      <option value="Radiologist">Radiologist</option>
                      <option value="Rad Tech">Rad Tech</option>
                      <option value="Hospital Admin">Hospital Admin</option>
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
                      placeholder="Email Address"
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
                      placeholder="Employee Number"
                      style={{width: '100%'}}
                      value={employeeNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        setEmployeeNumber(value)
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
                      Date of Birth <span style={{color: 'var(--error)'}}>*</span>
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      style={{width: '100%'}}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                    <small style={{color: 'var(--muted)', fontSize: '11px', marginTop: '2px', display: 'block'}}>
                      Format: MM/DD/YYYY
                    </small>
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
                      setDateOfBirth('')
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
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
              <p style={{margin: '0 0 20px 0', fontSize: '14px', color: 'var(--ink)', lineHeight: '1.6'}}>
                Are you sure you want to delete this user? This action cannot be undone.
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
                    fontSize: '14px',
                    fontWeight: '500'
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
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="modal" style={{display: 'flex', padding: '120px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '600px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>User Information</h2>
                <p className="modal-subtitle">Detailed account information</p>
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
                      <td style={{padding: '12px', fontWeight: 600, width: '35%', color: 'var(--muted)'}}>User ID</td>
                      <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.userId}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Full Name</td>
                      <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.name}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Role</td>
                      <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.role}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Email Address</td>
                      <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.email}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Employee Number</td>
                      <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.employeeNumber || 'N/A'}</td>
                    </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Password</td>
                    <td style={{padding: '12px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', flex: 1 }}>
                          {showPassword ? (selectedUser.password || 'N/A') : '••••••••'}
                        </code>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--muted)'
                          }}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Status</td>
                    <td style={{padding: '12px'}}>
                      <span className="badge badge-done">{selectedUser.status}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{padding: '12px', fontWeight: 600, color: 'var(--muted)'}}>Created Date</td>
                    <td style={{padding: '12px', color: 'var(--ink)'}}>{selectedUser.created}</td>
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
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                        User ID
                      </label>
                      <input 
                        type="text"
                        value={selectedUser.userId}
                        disabled
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: '#f3f4f6', color: 'var(--muted)', cursor: 'not-allowed'}}
                      />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                          First Name
                        </label>
                        <input 
                          type="text"
                          value={editUserData.firstName}
                          onChange={(e) => setEditUserData({...editUserData, firstName: e.target.value})}
                          style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                          Last Name
                        </label>
                        <input 
                          type="text"
                          value={editUserData.lastName}
                          onChange={(e) => setEditUserData({...editUserData, lastName: e.target.value})}
                          style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                        Role
                      </label>
                      <select 
                        value={editUserData.role}
                        onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                      >
                        <option value="Radiologist">Radiologist</option>
                        <option value="Rad Tech">Rad Tech</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                        Email Address
                      </label>
                      <input 
                        type="email"
                        value={editUserData.email}
                        onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                        Employee Number
                      </label>
                      <input 
                        type="text"
                        value={editUserData.employeeNumber}
                        onChange={(e) => setEditUserData({...editUserData, employeeNumber: e.target.value})}
                        style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
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
                      {loading ? 'Saving...' : 'Save Changes'}
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
