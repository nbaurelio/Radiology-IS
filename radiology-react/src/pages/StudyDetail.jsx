import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { studyService } from '../services/studyService'

const StudyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudy()
  }, [id])

  const loadStudy = async () => {
    try {
      const result = await studyService.getStudyById(id)
      if (result.success) {
        setStudy(result.study)
      }
    } catch (error) {
      console.error('Error loading study:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewImages = () => {
    if (!study || !study.dicom_files || study.dicom_files.length === 0) {
      alert('No DICOM files available to view')
      return
    }

    // Filter for DICOM files only
    const dicomFiles = study.dicom_files.filter(file => file.file_type === 'dicom' || !file.file_type)
    
    if (dicomFiles.length === 0) {
      alert('No DICOM files available to view')
      return
    }

    // Navigate to viewer page
    navigate(`/studies/${id}/viewer`)
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)'}}>Loading study...</p>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
            Study Not Found
          </h2>
          <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
            The study you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/upload" className="btn-create">
            Back to Studies
          </Link>
        </div>
      </div>
    )
  }

  const patientName = study.patients ? 
    `${study.patients.first_name} ${study.patients.last_name}` : 
    'Unknown Patient'

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
  }

  const getStatusBadgeClass = (status) => {
    return status === 'pending' ? 'badge-pending' :      // Yellow - Scheduled
          status === 'completed' ? 'badge-reading' :    // Blue - DICOM uploaded
          'badge-done'  // Green - Report finalized
  }
  const priorityText = study.priority === 'stat' ? 'STAT' : 
                      (study.priority || 'routine').charAt(0).toUpperCase() + (study.priority || 'routine').slice(1)
  const statusText = (study.status || 'pending').charAt(0).toUpperCase() + (study.status || 'pending').slice(1)
  const uploadDate = study.created_at ? new Date(study.created_at).toLocaleString() : 'N/A'

  return (
    <div className="container">
      <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link 
          to="/reports" 
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
          ← Back to Reports
        </Link>
        <button 
          onClick={() => navigate(`/reports/add?study_id=${id}`)}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, var(--brand), #7a5af8)', 
            color: 'white', 
            cursor: 'pointer', 
            fontFamily: 'inherit', 
            fontSize: '15px', 
            fontWeight: 700, 
            boxShadow: '0 6px 16px rgba(109,93,252,.25)', 
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <span className="material-icons" style={{fontSize: '21px'}}>add_circle</span>
          Create Report
        </button>
      </div>

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Study Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <tbody>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600, width: '30%'}}>Study ID</td>
                    <td style={{padding: '12px'}}>{study.study_id || 'N/A'}</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600}}>Upload Date</td>
                    <td style={{padding: '12px'}}>{uploadDate}</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600}}>Exam Type</td>
                    <td style={{padding: '12px'}}>{study.exam_type || 'N/A'}</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600}}>Modality</td>
                    <td style={{padding: '12px'}}>{study.modality || 'N/A'}</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600}}>Priority</td>
                    <td style={{padding: '12px'}}>
                      <span className={`badge ${getPriorityBadgeClass(study.priority)}`}>
                        {priorityText}
                      </span>
                    </td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--line)'}}>
                    <td style={{padding: '12px', fontWeight: 600}}>Status</td>
                    <td style={{padding: '12px'}}>
                      <span className={`badge ${getStatusBadgeClass(study.status)}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{padding: '12px', fontWeight: 600}}>Clinical History</td>
                    <td style={{padding: '12px'}}>{study.clinical_history || 'None provided'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Patient Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {study.patients ? (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <tbody>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600, width: '30%'}}>Patient ID</td>
                      <td style={{padding: '12px'}}>{study.patients.patient_id || 'N/A'}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Full Name</td>
                      <td style={{padding: '12px'}}>{patientName}</td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Date of Birth</td>
                      <td style={{padding: '12px'}}>
                        {study.patients.date_of_birth ? new Date(study.patients.date_of_birth).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Sex</td>
                      <td style={{padding: '12px'}}>
                        {study.patients.sex ? study.patients.sex.charAt(0).toUpperCase() + study.patients.sex.slice(1) : 'N/A'}
                      </td>
                    </tr>
                    <tr style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px', fontWeight: 600}}>Phone</td>
                      <td style={{padding: '12px'}}>{study.patients.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{padding: '12px', fontWeight: 600}}>Email</td>
                      <td style={{padding: '12px'}}>{study.patients.email || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p style={{color: 'var(--muted)'}}>Patient information not available</p>
              )}
            </div>
          </div>
        </article>

        {/* DICOM Files Section */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">
            DICOM Files ({study.dicom_files?.filter(file => file.file_type === 'dicom' || !file.file_type).length || 0})
            {study.dicom_files && study.dicom_files.filter(file => file.file_type === 'dicom' || !file.file_type).length > 0 && (
              <button
                onClick={handleViewImages}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 16px',
                  background: 'var(--brand)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="material-icons" style={{fontSize: '18px'}}>visibility</span>
                View Images
              </button>
            )}
          </div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {study.dicom_files && study.dicom_files.filter(file => file.file_type === 'dicom' || !file.file_type).length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {study.dicom_files.filter(file => file.file_type === 'dicom' || !file.file_type).map((file, index) => {
                    const sizeInMB = (file.size || file.file_size) ? ((file.size || file.file_size) / (1024 * 1024)).toFixed(2) : '0.00'
                    const fileName = file.name || file.file_name || `DICOM File ${index + 1}`
                    const fileIcon = fileName.endsWith('.zip') ? 'folder_zip' : 'insert_drive_file'
                    const uploadDate = (file.uploaded_at || file.upload_date) ? new Date(file.uploaded_at || file.upload_date).toLocaleString() : 'N/A'
                    
                    return (
                      <div key={fileName || index} className="file-item">
                        <div className="file-item-info">
                          <span className="material-icons" style={{color: 'var(--brand)'}}>{fileIcon}</span>
                          <div style={{flex: 1, minWidth: 0}}>
                            <div className="file-item-name">{fileName}</div>
                            <div className="file-item-size">{sizeInMB} MB • Uploaded: {uploadDate}</div>
                          </div>
                        </div>
                        <div className="file-item-status">
                          <span className="badge badge-done">Ready</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{color: 'var(--muted)'}}>No DICOM files uploaded for this study</p>
              )}
            </div>
          </div>
        </article>

        {/* Additional Files Section */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">
            Additional Files ({study.dicom_files?.filter(file => file.file_type === 'additional').length || 0})
          </div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {study.dicom_files && study.dicom_files.filter(file => file.file_type === 'additional').length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {study.dicom_files.filter(file => file.file_type === 'additional').map((file, index) => {
                    const sizeInMB = (file.size || file.file_size) ? ((file.size || file.file_size) / (1024 * 1024)).toFixed(2) : '0.00'
                    const fileName = file.name || file.file_name || `Additional File ${index + 1}`
                    const fileIcon = fileName.endsWith('.pdf') ? 'picture_as_pdf' :
                                   (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) ? 'image' :
                                   'insert_drive_file'
                    const uploadDate = (file.uploaded_at || file.upload_date) ? new Date(file.uploaded_at || file.upload_date).toLocaleString() : 'N/A'
                    
                    return (
                      <div key={fileName || index} className="file-item">
                        <div className="file-item-info">
                          <span className="material-icons" style={{color: 'var(--brand)'}}>{fileIcon}</span>
                          <div style={{flex: 1, minWidth: 0}}>
                            <div className="file-item-name">{fileName}</div>
                            <div className="file-item-size">{sizeInMB} MB • Uploaded: {uploadDate}</div>
                          </div>
                        </div>
                        <div className="file-item-status">
                          <span className="badge badge-done">Ready</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{color: 'var(--muted)'}}>No additional files uploaded for this study</p>
              )}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default StudyDetail