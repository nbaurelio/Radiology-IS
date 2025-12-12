import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { patientService } from '../services/patientService'
import { studyService } from '../services/studyService'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'
import { supabase } from '../lib/supabase'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const { addNotification } = useNotifications()

  // Schedule Appointment Modal States
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [studyId, setStudyId] = useState('')
  const [studyDate, setStudyDate] = useState('')
  const [priority, setPriority] = useState('routine')
  const [examType, setExamType] = useState('')
  const [modality, setModality] = useState('')
  const [clinicalHistory, setClinicalHistory] = useState('')
  const [scheduling, setScheduling] = useState(false)
  
  // New state for radiologists
  const [radiologists, setRadiologists] = useState([])
  const [selectedRadiologist, setSelectedRadiologist] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPatients(searchTerm.trim())
      } else {
        loadPatients()
      }
    }, 300)

    setSearchTimeout(timeout)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  const loadPatients = async () => {
    try {
      const result = await patientService.getAllPatients()
      if (result.success) {
        setPatients(result.patients)
      } else {
        console.error('Error loading patients:', result.message)
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRadiologists = async () => {
    try {
      // Fetch users with radiologist role (user_type_id = 2)
      const { data, error } = await supabase
        .from('users')
        .select('id, user_id, first_name, last_name, email')
        .eq('user_type_id', 2)
        .eq('is_active', true)
        .order('first_name', { ascending: true })

      if (error) throw error
      
      setRadiologists(data || [])
    } catch (error) {
      console.error('Error loading radiologists:', error)
      setRadiologists([])
    }
  }

  const searchPatients = async (term) => {
    try {
      const result = await patientService.searchPatients(term)
      if (result.success) {
        setPatients(result.patients)
      }
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const handleDeleteClick = (e, patient) => {
    e.stopPropagation()
    setPatientToDelete(patient)
    setDeleteConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!patientToDelete) return
    
    setLoading(true)
    try {
      const result = await patientService.deletePatient(patientToDelete.id)
      
      if (result.success) {
        addNotification(createNotification({
          type: 'patient_deleted',
          title: '🗑️ Patient Deleted',
          message: `Patient ${patientToDelete.first_name} ${patientToDelete.last_name} (ID: ${patientToDelete.patient_id}) has been successfully deleted.`,
          priority: PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.ADMIN,
          autoRemove: false
        }))
        await loadPatients()
      } else {
        addNotification(createNotification({
          type: 'patient_delete_failed',
          title: '❌ Delete Failed',
          message: `Failed to delete patient: ${result.message}`,
          priority: PRIORITY_LEVELS.URGENT,
          recipientRole: USER_ROLES.ADMIN,
          autoRemove: false
        }))
      }
    } catch (error) {
      console.error('Delete error:', error)
      addNotification(createNotification({
        type: 'patient_delete_failed',
        title: '❌ Delete Error',
        message: 'An error occurred while deleting the patient. Please try again.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.ADMIN,
        autoRemove: false
      }))
    } finally {
      setLoading(false)
      setDeleteConfirmModal(false)
      setPatientToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmModal(false)
    setPatientToDelete(null)
  }

  // Schedule Appointment Functions
  const handleScheduleAppointmentClick = async () => {
    setShowScheduleModal(true)
    await loadRadiologists() // Load radiologists when modal opens
    // Generate study ID when modal opens
    const generatedId = await studyService.generateStudyId()
    setStudyId(generatedId)
  }

  const handlePatientSelect = (e) => {
    const patientId = e.target.value
    if (patientId) {
      const patient = patients.find(p => p.id === patientId)
      setSelectedPatient(patient)
    } else {
      setSelectedPatient(null)
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatient) {
      alert('Please select a patient')
      return
    }

    if (!examType) {
      alert('Please select an exam type')
      return
    }

    if (!modality) {
      alert('Please select a modality')
      return
    }

    if (!selectedRadiologist) {
      alert('Please select a radiologist')
      return
    }

    if (!studyDate) {
      alert('Please select an appointment date and time')
      return
    }

    setScheduling(true)

    const currentUser = JSON.parse(localStorage.getItem('userSession') || '{}')
    const now = new Date().toISOString()

    // Get selected radiologist details if one was selected
    let assignedRadiologistName = null
    let assignedRadiologistId = null
    
    if (selectedRadiologist) {
      const radiologist = radiologists.find(r => r.id === selectedRadiologist)
      if (radiologist) {
        assignedRadiologistName = `${radiologist.first_name} ${radiologist.last_name}`
        assignedRadiologistId = radiologist.id
      }
    }

    const scheduleForDb = studyDate && studyDate.length === 16 ? `${studyDate}:00` : studyDate

    const studyData = {
      study_id: studyId,
      patient_uuid: selectedPatient.id,
      exam_type: examType,
      modality: modality,  // Remove "|| null" since it's now required
      clinical_history: clinicalHistory || 'No clinical history provided',
      priority: priority,
      status: 'pending',
      dicom_files: [],
      created_by: currentUser?.id || null,
      created_at: now,
      updated_at: now,
      schedule: scheduleForDb,
      assigned_radiologist: assignedRadiologistName,
      assigned_radiologist_id: assignedRadiologistId
    }

    try {
      const result = await studyService.createStudy(studyData)
      
      if (result.success) {
        // Update patient's next_appointment
        await patientService.updatePatient(selectedPatient.id, {
          next_appointment: scheduleForDb,
          last_visit_date: now
        })

        addNotification(createNotification({
          type: 'study_created',
          title: '✅ Appointment Scheduled',
          message: `Appointment ${studyId} has been scheduled for ${selectedPatient.first_name} ${selectedPatient.last_name}${assignedRadiologistName ? ` with ${assignedRadiologistName}` : ''}`,
          priority: priority === 'stat' ? PRIORITY_LEVELS.URGENT : PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.ADMIN,
          linkedEntity: { study_id: studyId, patient_id: selectedPatient.patient_id },
          actionLink: `/studies/${result.study.id}`,
          autoRemove: false
        }))

        alert('Appointment scheduled successfully!')
        
        // Reset form and close modal
        setShowScheduleModal(false)
        setSelectedPatient(null)
        setStudyDate('')
        setPriority('routine')
        setExamType('')
        setModality('')
        setClinicalHistory('')
        setSelectedRadiologist('')
        
        // Reload patients to show updated next appointment
        await loadPatients()
      } else {
        alert(`Failed to schedule appointment: ${result.message}`)
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setScheduling(false)
    }
  }

  const handleCancelSchedule = () => {
    setShowScheduleModal(false)
    setSelectedPatient(null)
    setStudyDate('')
    setPriority('routine')
    setExamType('')
    setModality('')
    setClinicalHistory('')
    setSelectedRadiologist('')
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatAppointment = (appointment) => {
    if (!appointment) {
      return <span className="badge badge-no-appointment">No Appointment</span>
    }

    const date = new Date(appointment)
    const dateStr = date.toLocaleDateString('en-CA')
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12

    return `${dateStr} ${hours}:${minutes} ${ampm}`
  }

  const formatContact = (patient) => {
    if (patient.phone && patient.email) {
      return `${patient.phone}<br><small style="color: var(--muted);">${patient.email}</small>`
    } else if (patient.phone) {
      return patient.phone
    } else if (patient.email) {
      return patient.email
    }
    return 'N/A'
  }

  return (
    <section className="grid">
      {/* Search and Add Patient Bar */}
      <article className="card search-bar">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name, ID, or exam type..." 
          />
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button 
            className="add-patient-btn" 
            onClick={handleScheduleAppointmentClick}
            aria-label="Schedule Appointment"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 60px'
            }}
            title="Schedule Appointment"
          >
            <span className="material-icons" style={{fontSize: '20px'}}>event_available</span>
            <span style={{fontSize: '14px', fontWeight: '600'}}>Schedule</span>
          </button>
          <button 
            className="add-patient-btn" 
            onClick={() => window.location.href = '/patients/add'}
            aria-label="Add Patient"
            title="Add Patient"
          >
            <span className="plus-icon">+</span>
          </button>
        </div>
      </article>

      {/* Patients List */}
      <article className="card table-card">
        <div className="hd">Patient Records (<span>{patients.length}</span>)</div>
        <div className="bd">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{width: '15%'}}>Patient ID</th>
                  <th style={{width: '20%'}}>Name</th>
                  <th style={{width: '10%'}}>Sex</th>
                  <th style={{width: '20%'}}>Next Appointment</th>
                  <th style={{width: '22%'}}>Contact</th>
                  <th style={{width: '13%'}}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '24px'}}>Loading patients...</td>
                  </tr>
                ) : patients.length > 0 ? (
                  patients.map((patient) => {
                    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.name || 'Unknown'
                    
                    return (
                      <tr 
                        key={patient.id}
                        style={{cursor: 'pointer'}}
                      >
                        <td data-label="Patient ID" onClick={() => window.location.href = `/patients/${patient.id}`}>{patient.patient_id || 'N/A'}</td>
                        <td data-label="Name" onClick={() => window.location.href = `/patients/${patient.id}`}>{fullName}</td>
                        <td data-label="Sex" onClick={() => window.location.href = `/patients/${patient.id}`}>{patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}</td>
                        <td data-label="Next Appointment" onClick={() => window.location.href = `/patients/${patient.id}`}>{formatAppointment(patient.next_appointment)}</td>
                        <td data-label="Contact" onClick={() => window.location.href = `/patients/${patient.id}`} dangerouslySetInnerHTML={{__html: formatContact(patient)}}></td>
                        <td data-label="" style={{textAlign: 'right', paddingRight: '48px'}}>
                          <button
                            onClick={(e) => handleDeleteClick(e, patient)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              padding: '8px 16px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'background 0.2s',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                            title="Delete patient"
                          >
                            <Trash2 size={16} />
                            DELETE
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '24px'}}>
                      {searchTerm 
                        ? 'No patients found matching your search.'
                        : 'No patients found. Click + to add a new patient.'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="modal" style={{display: 'flex', padding: '80px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '700px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Schedule Appointment</h2>
                <p className="modal-subtitle">Select a patient and schedule a new appointment</p>
              </div>
              <button className="close-btn" onClick={handleCancelSchedule}>&times;</button>
            </div>
            <div className="modal-body" style={{padding: '24px'}}>
              <form onSubmit={handleScheduleSubmit}>
                {/* Patient Selection */}
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px'}}>
                    Select Patient <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <select 
                    className="form-input" 
                    value={selectedPatient?.id || ''} 
                    onChange={handlePatientSelect}
                    required
                    style={{width: '100%'}}
                  >
                    <option value="">-- Select a patient --</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patient_id} - {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Details (shown when patient is selected) */}
                {selectedPatient && (
                  <div style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151'}}>
                      Patient Information
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px'}}>
                      <div>
                        <span style={{color: '#6b7280', fontWeight: '500'}}>Name:</span>{' '}
                        <span style={{color: '#111827'}}>{selectedPatient.first_name} {selectedPatient.last_name}</span>
                      </div>
                      <div>
                        <span style={{color: '#6b7280', fontWeight: '500'}}>Patient ID:</span>{' '}
                        <span style={{color: '#111827'}}>{selectedPatient.patient_id}</span>
                      </div>
                      <div>
                        <span style={{color: '#6b7280', fontWeight: '500'}}>Age:</span>{' '}
                        <span style={{color: '#111827'}}>{calculateAge(selectedPatient.date_of_birth)} years</span>
                      </div>
                      <div>
                        <span style={{color: '#6b7280', fontWeight: '500'}}>Sex:</span>{' '}
                        <span style={{color: '#111827'}}>{selectedPatient.sex ? selectedPatient.sex.charAt(0).toUpperCase() + selectedPatient.sex.slice(1) : 'N/A'}</span>
                      </div>
                      <div style={{gridColumn: '1 / -1'}}>
                        <span style={{color: '#6b7280', fontWeight: '500'}}>Contact:</span>{' '}
                        <span style={{color: '#111827'}}>{selectedPatient.phone || selectedPatient.email || 'N/A'}</span>
                      </div>
                      {selectedPatient.medical_history && (
                        <div style={{gridColumn: '1 / -1', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb'}}>
                          <span style={{color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px'}}>Medical History:</span>
                          <div style={{
                            color: '#111827', 
                            fontSize: '12px', 
                            lineHeight: '1.6',
                            maxHeight: '80px',
                            overflowY: 'auto',
                            padding: '8px',
                            background: 'white',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            {selectedPatient.medical_history}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Study Details */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Study ID
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={studyId}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Priority <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select 
                      className="form-input" 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      required
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Exam Type <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select 
                      className="form-input" 
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      required
                    >
                      <option value="">Select exam type</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="MRI">MRI</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="Mammography">Mammography</option>
                      <option value="Fluoroscopy">Fluoroscopy</option>
                      <option value="Nuclear Medicine">Nuclear Medicine</option>
                      <option value="PET Scan">PET Scan</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Modality <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select 
                      className="form-input" 
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      required
                    >
                      <option value="">Select modality</option>
                      <option value="CR">CR - Computed Radiography</option>
                      <option value="CT">CT - Computed Tomography</option>
                      <option value="MR">MR - Magnetic Resonance</option>
                      <option value="US">US - Ultrasound</option>
                      <option value="MG">MG - Mammography</option>
                      <option value="XA">XA - X-Ray Angiography</option>
                      <option value="NM">NM - Nuclear Medicine</option>
                      <option value="PT">PT - PET Scan</option>
                    </select>
                  </div>
                </div>

                {/* NEW: Assigned Radiologist Field */}
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Assigned Radiologist <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <select 
                    className="form-input" 
                    value={selectedRadiologist}
                    onChange={(e) => setSelectedRadiologist(e.target.value)}
                    style={{width: '100%'}}
                    required
                  >
                    <option value="">-- Select a radiologist --</option>
                    {radiologists.map(radiologist => (
                      <option key={radiologist.id} value={radiologist.id}>
                        {radiologist.user_id} - {radiologist.first_name} {radiologist.last_name}
                      </option>
                    ))}
                  </select>
                  <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    Assign this study to a specific radiologist
                  </small>
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Appointment Date & Time <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    style={{width: '100%'}}
                    required
                  />
                  <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    Required: Select date and time for the appointment
                  </small>
                </div>

                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Clinical History / Reason <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <textarea 
                    className="form-input" 
                    value={clinicalHistory}
                    onChange={(e) => setClinicalHistory(e.target.value)}
                    placeholder="Enter clinical history, symptoms, or reason for the appointment..."
                    rows="4"
                    style={{width: '100%'}}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  <button 
                    type="button"
                    onClick={handleCancelSchedule}
                    style={{
                      padding: '10px 24px',
                      border: '1px solid #d1d5db',
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
                    type="submit"
                    disabled={scheduling || !selectedPatient}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      background: scheduling || !selectedPatient ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: scheduling || !selectedPatient ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-icons" style={{fontSize: '18px'}}>event_available</span>
                    {scheduling ? 'Scheduling...' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Delete Patient</h2>
                <p className="modal-subtitle">Are you sure you want to delete this patient?</p>
              </div>
              <button className="close-btn" onClick={cancelDelete}>&times;</button>
            </div>
            <div className="modal-body">
              {patientToDelete && (
                <div style={{marginBottom: '20px'}}>
                  <p style={{marginBottom: '8px'}}><strong>Patient ID:</strong> {patientToDelete.patient_id}</p>
                  <p style={{marginBottom: '8px'}}><strong>Name:</strong> {`${patientToDelete.first_name || ''} ${patientToDelete.last_name || ''}`.trim() || 'Unknown'}</p>
                  <p style={{color: 'var(--error)', marginTop: '16px', fontSize: '14px'}}>
                    ⚠️ This action cannot be undone. All records associated with this patient will be permanently deleted.
                  </p>
                </div>
              )}
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  <button 
                    onClick={cancelDelete}
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
                    onClick={confirmDelete}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'var(--error)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Deleting...' : 'Delete Patient'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        
      )}
    </section>
  )
}

export default Patients