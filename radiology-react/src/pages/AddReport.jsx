import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, FileText, Image as ImageIcon, File, Download, ExternalLink } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const AddReport = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [studyData, setStudyData] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [formData, setFormData] = useState({
    study_id: '',
    patient_id: '',
    exam_type: '',
    modality: '',
    priority: 'routine',
    notes: '',
    findings: '',
    impression: '',
    recommendations: ''
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const studyIdFromUrl = params.get('study_id')
    
    if (studyIdFromUrl) {
      loadStudyData(studyIdFromUrl)
    }
  }, [location])

  const loadStudyData = async (id) => {
    try {
      const result = await studyService.getStudyById(id)
      if (result.success && result.study) {
        const study = result.study
        setStudyData(study)

        if ((study.status || '').toLowerCase() !== 'completed') {
          alert(`This study is "${study.status}". Only COMPLETED studies can have reports created.`)
          navigate('/reports')
          return
        }
        setFormData(prev => ({
          ...prev,
          study_id: study.study_id || '',
          patient_id: study.patients?.id || '',
          exam_type: study.exam_type || '',
          modality: study.modality || '',
          priority: study.priority || 'routine',
          notes: study.clinical_history || ''
        }))

        if (study.dicom_files && study.dicom_files.length > 0) {
          const firstFile = study.dicom_files[0]
          setSelectedFile(firstFile)
          await loadFilePreview(firstFile)
        }
      }
    } catch (error) {
      console.error('Error loading study:', error)
    }
  }

  const loadFilePreview = async (file) => {
    if (!file) {
      setFilePreviewUrl(null)
      return
    }

    try {
      const filePath = file.file_path || file.path
      if (!filePath) {
        setFilePreviewUrl(null)
        return
      }

      // Generate signed URL for the file
      const { data, error } = await supabase.storage
        .from('dicom-files')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (error) {
        console.error('Error generating signed URL:', error)
        setFilePreviewUrl(null)
        return
      }

      if (data?.signedUrl) {
        setFilePreviewUrl(data.signedUrl)
      }
    } catch (error) {
      console.error('Error loading file preview:', error)
      setFilePreviewUrl(null)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      if (studyData) {
        navigate(`/studies/${studyData.id}`)
      } else {
        navigate('/reports')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
      if (!formData.study_id) {
        alert('Missing Study ID')
        return
      }

    setLoading(true)
    
  const reportData = {
    study_id: formData.study_id,
    patient_id: formData.patient_id || null,
    exam_type: formData.exam_type,
    modality: formData.modality,
    priority: formData.priority,
    notes: formData.notes,

    // ✅ keep appointment datetime here
    schedule: studyData?.schedule || null,

    findings: formData.findings,
    impression: formData.impression,
    recommendations: formData.recommendations,

    // ✅ required DATE: derive from schedule
    study_date: studyData?.schedule
      ? String(studyData.schedule).slice(0, 10) // "YYYY-MM-DD"
      : new Date().toISOString().slice(0, 10),

    last_updated: new Date().toISOString(),
  }



    
    try {
      const result = await reportService.createReport(reportData)
      
      if (result.success) {
        if (studyData) {
          // ✅ after creating a report, the study becomes FINALIZED
          const upd = await studyService.updateStudyStatus(studyData.id, 'finalized')
          if (!upd.success) {
            console.error('Failed to finalize study:', upd.message)
            alert('Report saved, but study status failed to update. Please refresh or contact admin.')
          }
        }

        
        addNotification(createNotification({
          type: 'report_created',
          title: '✅ Report Created',
          message: `Report created for study ${formData.study_id || 'N/A'}. Status: Finalized.`,
          priority: PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.RADIOLOGIST,
          linkedEntity: { study_id: formData.study_id },
          actionLink: `/reports`,
          autoRemove: false
        }))
        navigate('/reports')
      } else {
        addNotification(createNotification({
          type: 'report_creation_failed',
          title: '❌ Report Creation Failed',
          message: `Error creating report: ${result.message}`,
          priority: PRIORITY_LEVELS.URGENT,
          recipientRole: USER_ROLES.RADIOLOGIST,
          autoRemove: false
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      addNotification(createNotification({
        type: 'report_creation_failed',
        title: '❌ Error',
        message: 'An unexpected error occurred while creating the report. Please try again.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.RADIOLOGIST,
        autoRemove: false
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileClick = async (file) => {
    setSelectedFile(file)
    await loadFilePreview(file)
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={20} />
    const ext = fileName.toLowerCase()
    if (ext.endsWith('.pdf')) return <FileText size={20} />
    if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) return <ImageIcon size={20} />
    if (ext.endsWith('.dcm') || ext.endsWith('.dicom')) return <File size={20} />
    return <File size={20} />
  }

  const handleDownloadFile = () => {
    if (filePreviewUrl) {
      window.open(filePreviewUrl, '_blank')
    }
  }

  const handleOpenInViewer = () => {
    if (studyData) {
      navigate(`/studies/${studyData.id}/viewer`)
    }
  }

  const renderFilePreview = () => {
    if (!selectedFile) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--muted)',
          fontSize: '14px',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <File size={48} color="var(--muted)" />
          <p>Select a file to preview</p>
        </div>
      )
    }

    const fileName = selectedFile.name || selectedFile.file_name || ''
    const ext = fileName.toLowerCase()

    // For PDF files - use object tag instead of iframe
    if (ext.endsWith('.pdf') && filePreviewUrl) {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
          <object
            data={filePreviewUrl}
            type="application/pdf"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            <div style={{
              padding: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <FileText size={48} color="var(--muted)" />
              <p style={{color: 'var(--muted)', marginBottom: '12px'}}>
                PDF preview not available in this browser
              </p>
              <button
                onClick={handleDownloadFile}
                style={{
                  padding: '8px 16px',
                  background: 'var(--brand)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <ExternalLink size={16} />
                Open PDF in New Tab
              </button>
            </div>
          </object>
        </div>
      )
    }

    // For image files
    if ((ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) && filePreviewUrl) {
      return (
        <img
          src={filePreviewUrl}
          alt="Medical Image"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      )
    }

    // For DICOM files - show placeholder with viewer button
    if (ext.endsWith('.dcm') || ext.endsWith('.dicom') || ext.endsWith('.zip')) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '16px'
        }}>
          <File size={64} color="var(--muted)" />
          <div style={{textAlign: 'center'}}>
            <p style={{margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--ink)'}}>
              DICOM File
            </p>
            <p style={{margin: 0, fontSize: '14px', color: 'var(--muted)', marginBottom: '16px'}}>
              {fileName}
            </p>
            <button
              onClick={handleOpenInViewer}
              style={{
                padding: '10px 20px',
                background: 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ExternalLink size={18} />
              Open in DICOM Viewer
            </button>
          </div>
        </div>
      )
    }

    // Default fallback
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '12px'
      }}>
        <File size={48} color="var(--muted)" />
        <p style={{color: 'var(--muted)', fontSize: '14px'}}>
          Preview not available for this file type
        </p>
        {filePreviewUrl && (
          <button
            onClick={handleDownloadFile}
            style={{
              padding: '8px 16px',
              background: 'var(--brand)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Download size={16} />
            Download File
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="container" style={{maxWidth: '100%', padding: '20px'}}>
      <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link 
          to={studyData ? `/studies/${studyData.id}` : '/reports'}
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
          ← Back to {studyData ? 'Study' : 'Reports'}
        </Link>
        <h1 style={{fontSize: '24px', margin: 0, color: 'var(--ink)'}}>Add New Report</h1>
        <div style={{width: '120px'}}></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: 'calc(100vh - 200px)'}}>
        {/* Left Side - Form */}
        <div style={{overflowY: 'auto', paddingRight: '10px'}}>
          <form onSubmit={handleSubmit}>
            {/* Study Information */}
            <article className="card" style={{marginBottom: '20px'}}>
              <div className="hd">Study Information</div>
              <div className="bd" style={{padding: '20px'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Study ID
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.study_id}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Patient
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={studyData?.patients ? `${studyData.patients.first_name} ${studyData.patients.last_name}` : 'N/A'}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Exam Type
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.exam_type || 'N/A'}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Modality
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.modality || 'N/A'}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Priority
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.priority ? formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1) : 'Routine'}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                      Assigned Radiologist
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={studyData?.assigned_radiologist || 'Not Assigned'}
                      readOnly
                      style={{background: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                </div>

                {/* Study Status - Read-only, always "Completed" */}
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Study Status
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    value="Completed"
                    readOnly
                    style={{
                      background: '#d1fae5',
                      cursor: 'not-allowed',
                      color: '#065f46',
                      fontWeight: '600',
                      border: '1px solid #6ee7b7'
                    }}
                  />
                  <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    Only completed studies can have reports created
                  </small>
                </div>

                {/* Clinical History/Notes - Read-only */}
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Clinical History / Notes
                  </label>
                  <textarea 
                    className="form-input"
                    value={studyData?.clinical_history || 'No clinical history provided'}
                    readOnly
                    rows="3"
                    style={{background: '#f3f4f6', cursor: 'not-allowed', resize: 'none'}}
                  />
                  <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    From scheduled appointment
                  </small>
                </div>
              </div>
            </article>

            {/* Report Content */}
            <article className="card" style={{marginBottom: '20px'}}>
              <div className="hd">Report Content</div>
              <div className="bd" style={{padding: '20px'}}>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Findings <span style={{color: 'var(--error)'}}>*</span>
                  </label>
                  <textarea 
                    name="findings"
                    className="form-input" 
                    placeholder="Describe the radiological findings..."
                    rows="6"
                    value={formData.findings}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Impression <span style={{color: 'var(--error)'}}>*</span>
                  </label>
                  <textarea 
                    name="impression"
                    className="form-input" 
                    placeholder="Provide clinical impression..."
                    rows="4"
                    value={formData.impression}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>
                    Recommendations
                  </label>
                  <textarea 
                    name="recommendations"
                    className="form-input" 
                    placeholder="Any recommendations for follow-up..."
                    rows="3"
                    value={formData.recommendations}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </article>

            {/* Form Actions */}
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button 
                type="button" 
                onClick={handleCancel}
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
                  background: loading ? '#9ca3af' : 'var(--brand)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                {loading ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Files and Preview */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {/* Files List */}
          <article className="card" style={{flex: '0 0 auto', maxHeight: '300px'}}>
            <div className="hd">Study Files ({studyData?.dicom_files?.length || 0})</div>
            <div className="bd" style={{padding: '12px', maxHeight: '250px', overflowY: 'auto'}}>
              {studyData?.dicom_files && studyData.dicom_files.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {studyData.dicom_files.map((file, index) => {
                    const fileName = file.name || file.file_name || `File ${index + 1}`
                    const fileSize = file.size || file.file_size
                    const sizeInMB = fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : '0.00'
                    const isSelected = selectedFile === file

                    return (
                      <div
                        key={index}
                        onClick={() => handleFileClick(file)}
                        style={{
                          padding: '12px',
                          border: `2px solid ${isSelected ? 'var(--brand)' : 'var(--line)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? '#f0f4ff' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{color: isSelected ? 'var(--brand)' : 'var(--muted)'}}>
                          {getFileIcon(fileName)}
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? 'var(--brand)' : 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {fileName}
                          </div>
                          <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '2px'}}>
                            {sizeInMB} MB
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{textAlign: 'center', color: 'var(--muted)', padding: '20px'}}>
                  No files available
                </p>
              )}
            </div>
          </article>

          {/* File Preview */}
          <article className="card" style={{flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <div className="hd" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                File Preview
                {selectedFile && (
                  <span style={{fontWeight: 400, fontSize: '13px', marginLeft: '8px', color: 'var(--muted)'}}>
                    {selectedFile.name || selectedFile.file_name}
                  </span>
                )}
              </div>
              {filePreviewUrl && (
                <button
                  onClick={handleDownloadFile}
                  style={{
                    padding: '4px 12px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: 'var(--ink)'
                  }}
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                  Open
                </button>
              )}
            </div>
            <div className="bd" style={{padding: '16px', flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {renderFilePreview()}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default AddReport