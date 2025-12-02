import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { patientService } from '../services/patientService'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const AddPatient = () => {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [mrnNumber, setMrnNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  useEffect(() => {
    loadPatientId()
  }, [])

  const loadPatientId = async () => {
    try {
      const id = await patientService.generatePatientId()
      setPatientId(id)
    } catch (error) {
      console.error('Error generating patient ID:', error)
      setPatientId('Error generating ID')
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/patients')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const firstName = document.getElementById('firstName').value.trim()
    const lastName = document.getElementById('lastName').value.trim()
    const now = new Date().toISOString()
    
    // Prepare patient data
    const patientData = {
      patient_id: document.getElementById('patientId').value.trim(),
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`,
      sex: document.getElementById('patientSex').value,
      date_of_birth: document.getElementById('dateOfBirth').value || null,
      email: document.getElementById('contactEmail').value.trim() || null,
      phone: phoneNumber,
      address: document.getElementById('address').value.trim() || null,
      mrn: mrnNumber ? `MRN-${mrnNumber}` : null,
      medical_history: document.getElementById('medicalHistory').value.trim() || null,
      registration_date: now,
      last_visit_date: null,
      notes: null,
      created_at: now,
      updated_at: now,
      next_appointment: null
    }
    
    try {
      const result = await patientService.createPatient(patientData)
      
      if (result.success) {
        alert('Patient profile created successfully!')
        
        // Send success notification
        const notification = createNotification({
          type: 'patient_created',
          title: '✅ Patient Added',
          message: `Patient ${firstName} ${lastName} (ID: ${patientData.patient_id}) has been successfully created.`,
          priority: PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.ADMIN,
          linkedEntity: { patient_id: patientData.patient_id },
          actionLink: `/patients/${result.patient.id}`,
          autoRemove: false
        })
        addNotification(notification)
        
        // Navigate to patients list
        navigate('/patients')
      } else {
        alert(`Error creating patient: ${result.message}`)
        
        // Send error notification
        const errorNotification = createNotification({
          type: 'patient_creation_failed',
          title: '❌ Patient Creation Failed',
          message: `Failed to create patient: ${result.message}`,
          priority: PRIORITY_LEVELS.URGENT,
          recipientRole: USER_ROLES.ADMIN,
          autoRemove: false
        })
        addNotification(errorNotification)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred. Please try again.')
      
      // Send error notification
      const errorNotification = createNotification({
        type: 'patient_creation_error',
        title: '⚠️ Unexpected Error',
        message: `An unexpected error occurred while creating the patient: ${error.message}`,
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.ADMIN,
        autoRemove: false
      })
      addNotification(errorNotification)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="form-page">
        <div style={{marginBottom: '20px'}}>
          <Link 
            to="/patients" 
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              border: '1px solid var(--card-border)', 
              borderRadius: 'var(--radius)', 
              background: 'var(--panel)', 
              color: 'var(--ink)', 
              cursor: 'pointer', 
              transition: 'border-color 0.2s ease', 
              fontFamily: 'inherit', 
              fontSize: '14px', 
              textDecoration: 'none', 
              width: 'fit-content'
            }}
          >
            ← Back to Patients
          </Link>
        </div>

        <h1 style={{fontSize: '28px', marginBottom: '24px', color: 'var(--text)'}}>Add New Patient</h1>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <h2 className="form-section-title">Personal Information</h2>
            <p className="form-section-subtitle">Basic information about the patient</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientId">Patient ID <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">badge</span>
                  <input 
                    type="text" 
                    id="patientId" 
                    className="form-input" 
                    placeholder="Auto-generating..." 
                    readOnly 
                    required 
                    value={patientId}
                    style={{paddingLeft: '40px'}}
                  />
                </div>
                <small style={{color: 'var(--muted)', marginTop: '4px', display: 'block'}}>
                  Auto-generated (e.g., PAT-2025-0001)
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="mrn">Medical Record Number (MRN)</label>
                <div className="input-with-icon" style={{position: 'relative'}}>
                  <span className="material-icons input-icon">assignment</span>
                  <span style={{
                    position: 'absolute',
                    left: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>MRN-</span>
                  <input 
                    type="text" 
                    id="mrn" 
                    className="form-input" 
                    placeholder="12345" 
                    value={mrnNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setMrnNumber(value)
                    }}
                    style={{paddingLeft: '85px'}} 
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input type="text" id="firstName" className="form-input" placeholder="Ex: John" required style={{paddingLeft: '40px'}} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input type="text" id="lastName" className="form-input" placeholder="Ex: Doe" required style={{paddingLeft: '40px'}} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">cake</span>
                  <input type="date" id="dateOfBirth" className="form-input" required style={{paddingLeft: '40px'}} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="patientSex">Sex <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">wc</span>
                  <select id="patientSex" className="form-input" required style={{paddingLeft: '40px'}}>
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2 className="form-section-title">Contact Information</h2>
            <p className="form-section-subtitle">How to reach the patient</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">phone</span>
                  <input 
                    type="tel" 
                    id="phoneNumber" 
                    className="form-input" 
                    placeholder="Ex: 15551234567" 
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setPhoneNumber(value)
                    }}
                    required 
                    style={{paddingLeft: '40px'}} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email Address</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">email</span>
                  <input type="email" id="contactEmail" className="form-input" placeholder="Ex: patient@email.com" style={{paddingLeft: '40px'}} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">home</span>
                  <input type="text" id="address" className="form-input" placeholder="Ex: 123 Main St, City, State, ZIP" style={{paddingLeft: '40px'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="form-section">
            <h2 className="form-section-title">Medical Information</h2>
            <p className="form-section-subtitle">Patient's medical history</p>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="medicalHistory">Medical History</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>description</span>
                  <textarea 
                    id="medicalHistory" 
                    className="form-input" 
                    placeholder="Enter relevant medical history, conditions, allergies, etc."
                    style={{paddingLeft: '40px'}}
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{alignItems: 'center'}}>
            <button type="button" className="btn-cancel" onClick={handleCancel} style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading} style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {loading ? 'Creating...' : 'Create Patient Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPatient