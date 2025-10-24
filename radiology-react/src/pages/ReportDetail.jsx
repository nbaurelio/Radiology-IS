import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'

const ReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadReport()
  }, [id])

  const loadReport = async () => {
    try {
      const result = await reportService.getReportById(id)
      if (result.success) {
        setReport(result.report)
      }
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const patientName = report && report.patients ? 
    `${report.patients.first_name} ${report.patients.last_name}` : 
    'Unknown Patient'

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
  }

  const getStatusBadgeClass = (status) => {
    return status === 'pending' ? 'badge-pending' :
           status === 'reading' ? 'badge-reading' : 'badge-done'
  }

  const priorityText = report && report.priority === 'stat' ? 'STAT' : 
                      (report && report.priority || 'routine').charAt(0).toUpperCase() + (report && report.priority || 'routine').slice(1)

  const handleEdit = () => {
    setIsEditMode(true)
    setEditData({
      exam_type: report.exam_type || '',
      modality: report.modality || '',
      priority: report.priority || 'routine',
      status: report.status || 'pending',
      assigned_radiologist: report.assigned_radiologist || '',
      findings: report.findings || '',
      impression: report.impression || '',
      recommendations: report.recommendations || '',
      notes: report.notes || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditData({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const result = await reportService.updateReport(id, editData)
      if (result.success) {
        setReport(result.report)
        setIsEditMode(false)
        alert('Report updated successfully!')
      } else {
        alert(`Error updating report: ${result.message}`)
      }
    } catch (error) {
      console.error('Error saving report:', error)
      alert('An error occurred while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)'}}>Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
            Report Not Found
          </h2>
          <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
            The report you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/reports" className="btn-create">
            Back to Reports
          </Link>
        </div>
      </div>
    )
  }

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
        {!isEditMode ? (
          <div style={{display: 'flex', gap: '12px'}}>
            <button 
              onClick={() => window.location.href = `/reports/${id}/generate`}
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
              <span className="material-symbols-outlined" style={{fontSize: '21px', color: 'var(--muted)'}}>picture_as_pdf</span>
              Generate Report
            </button>
            <button 
              onClick={handleEdit}
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
              Edit Report
            </button>
          </div>
        ) : (
          <div style={{display: 'flex', gap: '12px'}}>
            <button 
              onClick={handleCancelEdit}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                border: '1px solid var(--card-border)', 
                borderRadius: 'var(--radius)', 
                background: 'var(--panel)', 
                color: 'var(--ink)', 
                cursor: 'pointer', 
                fontFamily: 'inherit', 
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={saving}
              className="btn-create"
              style={{padding: '8px 16px'}}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Report Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {!isEditMode ? (
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-label">Study ID</div>
                    <div className="info-value">{report.study_id || 'N/A'}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Exam Type</div>
                    <div className="info-value">{report.exam_type || 'N/A'}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Modality</div>
                    <div className="info-value">{report.modality || 'N/A'}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Priority</div>
                    <div className="info-value">
                      <span className={`badge ${getPriorityBadgeClass(report.priority)}`}>
                        {priorityText}
                      </span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Status</div>
                    <div className="info-value">
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status ? report.status.toUpperCase() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Assigned Radiologist</div>
                    <div className="info-value">{report.assigned_radiologist || 'Unassigned'}</div>
                  </div>
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-group">
                    <label>Exam Type</label>
                    <input
                      type="text"
                      name="exam_type"
                      className="form-input"
                      value={editData.exam_type}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Modality</label>
                    <select
                      name="modality"
                      className="form-input"
                      value={editData.modality}
                      onChange={handleInputChange}
                    >
                      <option value="">Select modality</option>
                      <option value="CT">CT</option>
                      <option value="MRI">MRI</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="PET">PET</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      className="form-input"
                      value={editData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-input"
                      value={editData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Radiologist</label>
                    <input
                      type="text"
                      name="assigned_radiologist"
                      className="form-input"
                      value={editData.assigned_radiologist}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Patient Information */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Patient Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {report.patients ? (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px'}}>
                      <div>
                        <div className="info-label">Patient Name</div>
                        <div style={{fontSize: '20px', color: 'var(--ink)', fontWeight: 600}}>{patientName}</div>
                      </div>
                      <div style={{height: '40px', width: '1px', background: 'var(--line)'}}></div>
                      <div>
                        <div className="info-label">Patient ID</div>
                        <div style={{fontSize: '20px', color: 'var(--ink)', fontWeight: 600}}>
                          {report.patients.patient_id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/patients/${report.patients.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      background: 'var(--panel)',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <span className="material-icons" style={{fontSize: '20px'}}>person</span>
                    View Patient Details
                  </Link>
                </div>
              ) : (
                <p style={{color: 'var(--muted)'}}>No patient information available</p>
              )}
            </div>
          </div>
        </article>

        {/* Study Details */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Study Details</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Study Date</div>
                  <div className="info-value">
                    {report.study_date ? new Date(report.study_date).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Scheduled Date</div>
                  <div className="info-value">
                    {report.schedule ? new Date(report.schedule).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Report Status</div>
                  <div className="info-value">{report.report_status || 'Draft'}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Created At</div>
                  <div className="info-value">
                    {report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Last Updated</div>
                  <div className="info-value">
                    {report.updated_at ? new Date(report.updated_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Notification Sent</div>
                  <div className="info-value">{report.notification_sent ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Associated Study Files */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Associated Study Files</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {report.study_id ? (
                <StudyFilesSection studyId={report.study_id} />
              ) : (
                <p style={{color: 'var(--muted)'}}>No associated study found</p>
              )}
            </div>
          </div>
        </article>

        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Report Content</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {!isEditMode ? (
                <>
                  <div style={{marginBottom: '24px'}}>
                    <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)'}}>
                      Findings
                    </h3>
                    <p style={{color: 'var(--ink)', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                      {report.findings || 'No findings recorded.'}
                    </p>
                  </div>

                  <div style={{marginBottom: '24px'}}>
                    <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)'}}>
                      Impression
                    </h3>
                    <p style={{color: 'var(--ink)', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                      {report.impression || 'No impression recorded.'}
                    </p>
                  </div>

                  {report.recommendations && (
                    <div style={{marginBottom: '24px'}}>
                      <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)'}}>
                        Recommendations
                      </h3>
                      <p style={{color: 'var(--ink)', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                        {report.recommendations}
                      </p>
                    </div>
                  )}

                  {report.notes && (
                    <div>
                      <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)'}}>
                        Notes
                      </h3>
                      <p style={{color: 'var(--ink)', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                        {report.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group" style={{marginBottom: '20px'}}>
                    <label>Findings</label>
                    <textarea
                      name="findings"
                      className="form-input"
                      rows="6"
                      value={editData.findings}
                      onChange={handleInputChange}
                      placeholder="Enter findings..."
                    />
                  </div>

                  <div className="form-group" style={{marginBottom: '20px'}}>
                    <label>Impression</label>
                    <textarea
                      name="impression"
                      className="form-input"
                      rows="6"
                      value={editData.impression}
                      onChange={handleInputChange}
                      placeholder="Enter impression..."
                    />
                  </div>

                  <div className="form-group" style={{marginBottom: '20px'}}>
                    <label>Recommendations</label>
                    <textarea
                      name="recommendations"
                      className="form-input"
                      rows="4"
                      value={editData.recommendations}
                      onChange={handleInputChange}
                      placeholder="Enter recommendations..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      className="form-input"
                      rows="4"
                      value={editData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter additional notes..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

// Component to display study files
const StudyFilesSection = ({ studyId }) => {
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudy()
  }, [studyId])

  const loadStudy = async () => {
    try {
      const result = await studyService.getStudyById(studyId)
      if (result.success) {
        setStudy(result.study)
      }
    } catch (error) {
      console.error('Error loading study:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p style={{color: 'var(--muted)'}}>Loading study files...</p>
  }

  if (!study) {
    return <p style={{color: 'var(--muted)'}}>Study not found</p>
  }

  const dicomFiles = study.dicom_files?.filter(file => file.file_type === 'dicom' || !file.file_type) || []
  const additionalFiles = study.dicom_files?.filter(file => file.file_type === 'additional') || []

  return (
    <div>
      {/* DICOM Files */}
      {dicomFiles.length > 0 && (
        <div style={{marginBottom: '24px'}}>
          <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--ink)'}}>
            DICOM Files ({dicomFiles.length})
          </h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {dicomFiles.map((file, index) => {
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
        </div>
      )}

      {/* Additional Files */}
      {additionalFiles.length > 0 && (
        <div>
          <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--ink)'}}>
            Additional Files ({additionalFiles.length})
          </h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {additionalFiles.map((file, index) => {
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
        </div>
      )}

      {dicomFiles.length === 0 && additionalFiles.length === 0 && (
        <p style={{color: 'var(--muted)'}}>No files found for this study</p>
      )}
    </div>
  )
}

export default ReportDetail
