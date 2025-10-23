import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { patientService } from '../services/patientService'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)

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
        alert('Patient deleted successfully')
        await loadPatients()
      } else {
        alert(`Error deleting patient: ${result.message}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting the patient')
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
        <button 
          className="add-patient-btn" 
          onClick={() => window.location.href = '/patients/add'}
          aria-label="Add Patient"
        >
          <span className="plus-icon">+</span>
        </button>
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
