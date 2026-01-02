import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'
import { supabase } from '../lib/supabase'

const ReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  const [radiologists, setRadiologists] = useState([])
  const [radiologistsLoading, setRadiologistsLoading] = useState(true)

  useEffect(() => {
    const fetchRadiologists = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('user_type_id', 2)  // ← Only Radiologists (id = 2)
          .order('last_name', { ascending: true })

        if (error) throw error

        setRadiologists(data || [])
      } catch (err) {
        console.error('Error fetching radiologists:', err)
        setRadiologists([])
      } finally {
        setRadiologistsLoading(false)
      }
    }

    fetchRadiologists()
  }, [])

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
    return status === 'pending' ? 'badge-pending' :      // Yellow - Scheduled
          status === 'completed' ? 'badge-reading' :    // Blue - DICOM uploaded
          'badge-done'  // Green - Report finalized
  }

  const priorityText = report && report.priority === 'stat' ? 'STAT' : 
                      (report && report.priority || 'routine').charAt(0).toUpperCase() + (report && report.priority || 'routine').slice(1)

  const handleEdit = () => {
    setIsEditMode(true)
    setEditData({
      exam_type: report.exam_type || '',
      modality: report.modality || '',
      priority: report.priority || 'routine',
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
              onClick={() => navigate(`/reports/${id}/generate`)}
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
                    <label>Assigned Radiologist</label>
                    {radiologistsLoading ? (
                      <p style={{color: 'var(--muted)', fontSize: '14px', marginTop: '8px'}}>Loading radiologists...</p>
                    ) : (
                      <select
                        name="assigned_radiologist"
                        className="form-input"
                        value={editData.assigned_radiologist || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Unassigned</option>
                        {radiologists.map((rad) => (
                          <option key={rad.id} value={`${rad.first_name} ${rad.last_name}`}>
                            {rad.first_name} {rad.last_name}
                          </option>
                        ))}
                      </select>
                    )}
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
                  <div className="info-label">Scheduled Date</div>
                  <div className="info-value">
                    {report.schedule ? new Date(report.schedule).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Report Status</div>
                  <div className="info-value">{report.status || 'Draft'}</div>
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
                <StudyFilesByStudyIdString studyIdString={report.study_id} />
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

// New component: Loads files using the human-readable study_id (like "STU-2025-0030")
const StudyFilesByStudyIdString = ({ studyIdString }) => {
  const navigate = useNavigate()
  const [files, setFiles] = useState({ dicom: [], additional: [] })
  const [loading, setLoading] = useState(true)
  const [studyInternalId, setStudyInternalId] = useState(null)

  useEffect(() => {
    const loadFiles = async () => {
      if (!studyIdString) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('studies')
          .select('id, dicom_files')
          .eq('study_id', studyIdString)
          .single()

        if (error) throw error

        setStudyInternalId(data?.id)
        const allFiles = data?.dicom_files || []

        const dicomFiles = allFiles.filter(f => f.file_type === 'dicom' || !f.file_type)
        const additionalFiles = allFiles.filter(f => f.file_type === 'additional')

        setFiles({ dicom: dicomFiles, additional: additionalFiles })
      } catch (err) {
        console.error('Error loading files for study:', err)
        setFiles({ dicom: [], additional: [] })
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [studyIdString])

  const handleViewImages = () => {
    if (!studyInternalId || files.dicom.length === 0) {
      alert('No DICOM files available to view')
      return
    }
    navigate(`/studies/${studyInternalId}/viewer`)
  }

  if (loading) {
    return <p style={{color: 'var(--muted)'}}>Loading study files...</p>
  }

  const { dicom, additional } = files

  if (dicom.length === 0 && additional.length === 0) {
    return <p style={{color: 'var(--muted)'}}>No files found for this study</p>
  }

  return (
    <div>
      {/* DICOM Files */}
      {dicom.length > 0 && (
        <div style={{marginBottom: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <h4 style={{fontSize: '16px', fontWeight: '600', color: 'var(--ink)'}}>
              DICOM Files ({dicom.length})
            </h4>
            <button
              onClick={handleViewImages}
              style={{
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
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {dicom.map((file, index) => {
              const sizeInMB = file.size ? (file.size / (1024 * 1024)).toFixed(2) : '0.00'
              const fileName = file.name || 'Untitled DICOM'
              const uploadDate = file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'N/A'

              return (
                <div key={index} className="file-item">
                  <div className="file-item-info">
                    <span className="material-icons" style={{color: 'var(--brand)', fontSize: '24px'}}>
                      description
                    </span>
                    <div style={{flex: 1, minWidth: 0, marginLeft: '12px'}}>
                      <div className="file-item-name" style={{fontWeight: 600, color: 'var(--ink)'}}>
                        {fileName}
                      </div>
                      <div className="file-item-size" style={{color: 'var(--muted)', fontSize: '13px'}}>
                        {sizeInMB} MB • Uploaded: {uploadDate}
                      </div>
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
      {additional.length > 0 && (
        <div>
          <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--ink)'}}>
            Additional Files ({additional.length})
          </h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {additional.map((file, index) => {
              const sizeInMB = file.size ? (file.size / (1024 * 1024)).toFixed(2) : '0.00'
              const fileName = file.name || 'Untitled File'
              const uploadDate = file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'N/A'

              let icon = 'insert_drive_file'
              const lowerName = fileName.toLowerCase()
              if (lowerName.endsWith('.pdf')) icon = 'picture_as_pdf'
              else if (/\.(jpe?g|png|gif)$/i.test(lowerName)) icon = 'image'
              else if (lowerName.endsWith('.zip')) icon = 'folder_zip'

              return (
                <div key={index} className="file-item">
                  <div className="file-item-info">
                    <span className="material-icons" style={{color: 'var(--brand)', fontSize: '24px'}}>
                      {icon}
                    </span>
                    <div style={{flex: 1, minWidth: 0, marginLeft: '12px'}}>
                      <div className="file-item-name" style={{fontWeight: 600, color: 'var(--ink)'}}>
                        {fileName}
                      </div>
                      <div className="file-item-size" style={{color: 'var(--muted)', fontSize: '13px'}}>
                        {sizeInMB} MB • Uploaded: {uploadDate}
                      </div>
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
    </div>
  )
}

export default ReportDetail
