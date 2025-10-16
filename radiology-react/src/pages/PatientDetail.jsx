import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { patientService } from '../services/patientService'
import { ArrowLeft, Calendar, Phone, Mail, User } from 'lucide-react'

const PatientDetail = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    loadPatientDetail()
  }, [id])

  const loadPatientDetail = async () => {
    try {
      const result = await patientService.getPatientDetail(id)
      if (result.success) {
        setPatient(result.patient)
        setAppointments(result.appointments)
      } else {
        console.error('Error loading patient:', result.message)
      }
    } catch (error) {
      console.error('Error loading patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditInfo = () => {
    setIsEditMode(true)
    setEditData({
      patient_id: patient.patient_id || '',
      mrn: patient.mrn || '',
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      sex: patient.sex || 'male',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      medical_history: patient.medical_history || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditData({})
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await patientService.updatePatient(id, editData)
      
      if (result.success) {
        alert('Patient information updated successfully!')
        setPatient(result.patient)
        setIsEditMode(false)
        setEditData({})
      } else {
        alert('Error updating patient: ' + result.message)
      }
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Error updating patient information')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)'}}>Loading patient details...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
            Patient Not Found
          </h2>
          <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/patients" className="btn-create">
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown'

  return (
    <div className="container">
      <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
            textDecoration: 'none'
          }}
        >
          ← Back to Patients
        </Link>
        <button 
          onClick={handleEditInfo}
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
            fontSize: '14px'
          }}
        >
          <span className="material-icons" style={{fontSize: '21px', color: 'var(--muted)'}}>edit</span>
          Edit Info
        </button>
      </div>

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Patient Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {isEditMode ? (
                <form onSubmit={handleSaveEdit}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600, width: '30%'}}>Patient ID</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="text" 
                            name="patient_id"
                            value={editData.patient_id}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                            required
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Medical Record Number (MRN)</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="text" 
                            name="mrn"
                            value={editData.mrn}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>First Name</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="text" 
                            name="first_name"
                            value={editData.first_name}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                            required
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Last Name</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="text" 
                            name="last_name"
                            value={editData.last_name}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                            required
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Date of Birth</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="date" 
                            name="date_of_birth"
                            value={editData.date_of_birth}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Sex</td>
                        <td style={{padding: '12px'}}>
                          <select 
                            name="sex"
                            value={editData.sex}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Phone</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="tel" 
                            name="phone"
                            value={editData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Email</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="email" 
                            name="email"
                            value={editData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Address</td>
                        <td style={{padding: '12px'}}>
                          <input 
                            type="text" 
                            name="address"
                            value={editData.address}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Medical History Summary</td>
                        <td style={{padding: '12px'}}>
                          <textarea 
                            name="medical_history"
                            value={editData.medical_history}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)', minHeight: '80px'}}
                          />
                        </td>
                      </tr>
                      <tr style={{borderBottom: '1px solid var(--line)'}}>
                        <td style={{padding: '12px', fontWeight: 600}}>Registration Date</td>
                        <td style={{padding: '12px'}}>
                          {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{padding: '12px', fontWeight: 600}}>Last Visit / Last Study</td>
                        <td style={{padding: '12px'}}>
                          {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'No visits recorded'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="btn"
                      style={{border: '1px solid var(--card-border)', padding: '8px 16px', borderRadius: '6px', background: 'var(--panel)', cursor: 'pointer'}}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn"
                      style={{background: 'linear-gradient(135deg, var(--brand), #7a5af8)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <tbody>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, width: '30%'}}>Patient ID</td>
                      <td style={{padding: '12px'}}>{patient.patient_id || 'N/A'}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Medical Record Number (MRN)</td>
                      <td style={{padding: '12px'}}>{patient.mrn || 'N/A'}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Full Name</td>
                      <td style={{padding: '12px'}}>{fullName}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Date of Birth</td>
                      <td style={{padding: '12px'}}>
                        {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Sex</td>
                      <td style={{padding: '12px'}}>
                        {patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}
                      </td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Contact Information</td>
                      <td style={{padding: '12px'}}>
                        {patient.phone && `Phone: ${patient.phone}`}
                        {patient.phone && patient.email && <br />}
                        {patient.email && `Email: ${patient.email}`}
                        {!patient.phone && !patient.email && 'N/A'}
                      </td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Address</td>
                      <td style={{padding: '12px'}}>{patient.address || 'N/A'}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Medical History Summary</td>
                      <td style={{padding: '12px'}}>{patient.medical_history || 'No medical history recorded'}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Registration Date</td>
                      <td style={{padding: '12px'}}>
                        {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{padding: '12px', fontWeight: 600}}>Last Visit / Last Study</td>
                      <td style={{padding: '12px'}}>
                        {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'No visits recorded'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </article>

        {/* Appointments Section */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Appointments</div>
          <div className="bd">
            {appointments && appointments.length > 0 ? (
              appointments.map((apt, index) => {
                const getStatusBadgeClass = (status) => {
                  if (status === 'scheduled' || status === 'pending') return 'badge-pending'
                  if (status === 'completed') return 'badge-done'
                  return 'badge-reading'
                }
                
                const formatDateTime = (dateValue) => {
                  if (!dateValue) return 'N/A'
                  const date = new Date(dateValue)
                  const datePart = date.toLocaleDateString('en-CA')
                  let hours = date.getHours()
                  const minutes = date.getMinutes().toString().padStart(2, '0')
                  const ampm = hours >= 12 ? 'PM' : 'AM'
                  hours = hours % 12 || 12
                  return `${datePart} ${hours}:${minutes} ${ampm}`
                }
                
                const dateStr = formatDateTime(apt.created_at || apt.study_date || apt.schedule)
                const status = apt.status || 'pending'
                const statusClass = getStatusBadgeClass(status)
                const studyId = apt.study_id || 'N/A'
                const isStudy = apt.type === 'study'
                const typeLabel = isStudy ? 'DICOM Study' : 'Report'
                const title = isStudy ? 'DICOM Study Upload' : (apt.exam_type || 'Radiology Report')
                const description = isStudy ? 
                  (apt.clinical_history || 'No clinical history provided') : 
                  (apt.notes || 'No notes provided')
                const fileInfo = isStudy && apt.dicom_files ? `${apt.dicom_files.length} DICOM file(s)` : ''
                
                return (
                  <div 
                    key={index}
                    style={{
                      padding: '16px', 
                      borderBottom: index < appointments.length - 1 ? '1px solid var(--line)' : 'none', 
                      cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = `${isStudy ? '/study' : '/reports'}/${apt.id}`}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                          <span style={{fontSize: '14px'}}>{typeLabel}</span>
                          <strong>{title}</strong>
                        </div>
                        <span style={{color: 'var(--muted)', fontSize: '14px'}}>{dateStr}</span><br />
                        <span style={{color: 'var(--muted)', fontSize: '13px'}}>Study ID: {studyId}</span><br />
                        {fileInfo && (
                          <>
                            <span style={{color: 'var(--muted)', fontSize: '13px'}}>{fileInfo}</span><br />
                          </>
                        )}
                        <p style={{margin: '8px 0 0 0', fontSize: '14px', color: 'var(--muted)'}}>{description}</p>
                      </div>
                      <span className={`badge ${statusClass}`}>{status.toUpperCase()}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={{textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>
                No studies or reports found
              </p>
            )}
          </div>
        </article>

        {/* Studies History */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Studies History</div>
          <div className="bd">
            {appointments && appointments.filter(a => a.type === 'study').length > 0 ? (
              appointments.filter(a => a.type === 'study').map((study, index) => {
                const getStatusBadgeClass = (status) => {
                  if (status === 'scheduled' || status === 'pending') return 'badge-pending'
                  if (status === 'completed') return 'badge-done'
                  return 'badge-reading'
                }
                
                const date = study.study_date ? new Date(study.study_date).toLocaleDateString() : 'N/A'
                const statusClass = getStatusBadgeClass(study.status || 'pending')
                
                return (
                  <div 
                    key={index}
                    style={{
                      padding: '16px', 
                      borderBottom: index < appointments.filter(a => a.type === 'study').length - 1 ? '1px solid var(--line)' : 'none'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <strong>{study.study_id}</strong> - {study.exam_type || 'N/A'}<br />
                        <span style={{color: 'var(--muted)', fontSize: '14px'}}>
                          Date: {date} | Modality: {study.modality || 'N/A'}
                        </span>
                      </div>
                      <span className={`badge ${statusClass}`}>{(study.status || 'pending').toUpperCase()}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={{textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>
                No studies found
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default PatientDetail
