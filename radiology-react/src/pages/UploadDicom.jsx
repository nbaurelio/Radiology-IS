import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studyService } from '../services/studyService'
import { patientService } from '../services/patientService'
import { useNotifications } from '../contexts/NotificationContext'
import { notifyUploadSuccess, notifyUploadFailed } from '../services/notificationService'
import { supabase } from '../lib/supabase'

const UploadDicom = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedPatientData, setSelectedPatientData] = useState(null)
  const [pendingStudies, setPendingStudies] = useState([])
  const [selectedStudy, setSelectedStudy] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loadingStudies, setLoadingStudies] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadPendingStudiesForPatient(selectedPatient)
    } else {
      setPendingStudies([])
      setSelectedStudy(null)
    }
  }, [selectedPatient])

  const loadPatients = async () => {
    try {
      const result = await patientService.getAllPatients()
      if (result.success) {
        setPatients(result.patients)
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const loadPendingStudiesForPatient = async (patientId) => {
    setLoadingStudies(true)
    try {
      // Get all studies for this patient
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('patient_uuid', patientId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter studies that don't have DICOM files yet
      const studiesWithoutFiles = (data || []).filter(study => 
        !study.dicom_files || study.dicom_files.length === 0
      )

      setPendingStudies(studiesWithoutFiles)
      
      // Auto-select if only one study
      if (studiesWithoutFiles.length === 1) {
        setSelectedStudy(studiesWithoutFiles[0])
      } else {
        setSelectedStudy(null)
      }
    } catch (error) {
      console.error('Error loading pending studies:', error)
      setPendingStudies([])
    } finally {
      setLoadingStudies(false)
    }
  }

  const handlePatientSelect = (e) => {
    const patientId = e.target.value
    setSelectedPatient(patientId)
    
    if (patientId) {
      const patient = patients.find(p => p.id === patientId)
      setSelectedPatientData(patient)
    } else {
      setSelectedPatientData(null)
    }
  }

  const handleStudySelect = (study) => {
    setSelectedStudy(study)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (fileList) => {
    const dicomFiles = []
    const additionalFiles = []
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    const dicomExtensions = ['.dcm', '.dicom', '.zip']
    const additionalExtensions = ['.pdf', '.jpg', '.jpeg', '.png']
    
    for (let file of fileList) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 2GB limit and will be skipped.`)
        continue
      }
      
      const fileName = file.name.toLowerCase()
      const isDicomFile = dicomExtensions.some(ext => fileName.endsWith(ext))
      const isAdditionalFile = additionalExtensions.some(ext => fileName.endsWith(ext))
      
      if (isDicomFile) {
        dicomFiles.push(file)
      } else if (isAdditionalFile) {
        additionalFiles.push(file)
      } else {
        alert(`File "${file.name}" has invalid extension. Only .dcm, .dicom, .zip, .pdf, .jpg, .jpeg, and .png files are supported.`)
        continue
      }
    }
    
    if (dicomFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...dicomFiles])
    }
    if (additionalFiles.length > 0) {
      setSelectedAdditionalFiles([...selectedAdditionalFiles, ...additionalFiles])
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const removeAdditionalFile = (index) => {
    setSelectedAdditionalFiles(selectedAdditionalFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      alert('Please select a patient')
      return
    }

    if (!selectedStudy) {
      alert('Please select a study to upload files to')
      return
    }
    
    if (selectedFiles.length === 0 && selectedAdditionalFiles.length === 0) {
      alert('Please select at least one file (DICOM or additional files)')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload DICOM files if any
      let dicomUploadResult = { success: true, uploadedCount: 0 }
      if (selectedFiles.length > 0) {
        dicomUploadResult = await studyService.uploadDicomFiles(
          selectedStudy.id,
          selectedStudy.study_id,
          selectedFiles
        )
      }
      
      // Upload additional files if any
      let additionalUploadResult = { success: true, uploadedCount: 0 }
      if (selectedAdditionalFiles.length > 0) {
        additionalUploadResult = await studyService.uploadAdditionalFiles(
          selectedStudy.id,
          selectedStudy.study_id,
          selectedAdditionalFiles
        )
      }
      
      if (dicomUploadResult.success && additionalUploadResult.success) {
        const totalFiles = selectedFiles.length + selectedAdditionalFiles.length
        const totalUploaded = dicomUploadResult.uploadedCount + additionalUploadResult.uploadedCount
        let message = `Files uploaded successfully to ${selectedStudy.study_id}!\n`
        if (selectedFiles.length > 0) {
          message += `DICOM Files: ${dicomUploadResult.uploadedCount}/${selectedFiles.length}\n`
        }
        if (selectedAdditionalFiles.length > 0) {
          message += `Additional Files: ${additionalUploadResult.uploadedCount}/${selectedAdditionalFiles.length}\n`
        }
        message += `Total: ${totalUploaded}/${totalFiles}`
        alert(message)

        // Send notification
        const notif = notifyUploadSuccess({
          study_id: selectedStudy.study_id,
          patient_id: selectedStudy.patient_uuid,
          patient_name: selectedPatientData ? `${selectedPatientData.first_name} ${selectedPatientData.last_name}` : 'Unknown',
          modality: selectedStudy.modality || 'N/A',
          exam_type: selectedStudy.exam_type || 'General Study'
        })
        addNotification(notif)
        
        // ✅ Mark study as COMPLETED after successful upload
        const { error: statusError } = await supabase
          .from('studies')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', selectedStudy.id)

        if (statusError) {
          console.error('Failed to update study status:', statusError)
          alert('Files uploaded, but failed to update study status to Completed.')
        }
        
        // Reset form
        setSelectedFiles([])
        setSelectedAdditionalFiles([])
        setSelectedPatient('')
        setSelectedPatientData(null)
        setPendingStudies([])
        setSelectedStudy(null)
        
        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        let errorMessage = `File upload had issues:\n`
        if (selectedFiles.length > 0) {
          errorMessage += `DICOM: ${dicomUploadResult.message}\n`
        }
        if (selectedAdditionalFiles.length > 0) {
          errorMessage += `Additional: ${additionalUploadResult.message}`
        }
        alert(errorMessage)

        // Send error notification
        const errorNotif = notifyUploadFailed(
          {
            patient_id: selectedStudy.patient_uuid,
            patient_name: selectedPatientData ? `${selectedPatientData.first_name} ${selectedPatientData.last_name}` : 'Unknown'
          },
          'Some files failed to upload. Please check the file formats.'
        )
        addNotification(errorNotif)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('An error occurred while uploading. Please try again.')
      
      // Send error notification
      const errorNotif = notifyUploadFailed(
        { patient_id: selectedPatient, patient_name: 'Unknown' },
        error.message || 'An unexpected error occurred'
      )
      addNotification(errorNotif)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
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

  return (
    <div className="container">
      <div className="form-page">
        <h1 style={{fontSize: '28px', marginBottom: '24px', color: 'var(--text)'}}>Upload DICOM Files to Existing Study</h1>

        <form onSubmit={handleSubmit}>
          {/* Patient Selection Section */}
          <div className="form-section">
            <h2 className="form-section-title">Step 1: Select Patient</h2>
            <p className="form-section-subtitle">Choose the patient whose study you want to upload files to</p>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="patientSelect">Select Patient <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <select 
                    id="patientSelect" 
                    className="form-input" 
                    required
                    value={selectedPatient}
                    onChange={handlePatientSelect}
                    style={{paddingLeft: '40px'}}
                  >
                    <option value="">Select a patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.patient_id} - {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Patient Info Display */}
            {selectedPatientData && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <h3 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0c4a6e'}}>
                  Patient Information
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px'}}>
                  <div>
                    <span style={{color: '#64748b', fontWeight: '500'}}>Name:</span>{' '}
                    <span style={{color: '#0f172a'}}>{selectedPatientData.first_name} {selectedPatientData.last_name}</span>
                  </div>
                  <div>
                    <span style={{color: '#64748b', fontWeight: '500'}}>Patient ID:</span>{' '}
                    <span style={{color: '#0f172a'}}>{selectedPatientData.patient_id}</span>
                  </div>
                  <div>
                    <span style={{color: '#64748b', fontWeight: '500'}}>Sex:</span>{' '}
                    <span style={{color: '#0f172a'}}>{selectedPatientData.sex ? selectedPatientData.sex.charAt(0).toUpperCase() + selectedPatientData.sex.slice(1) : 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{color: '#64748b', fontWeight: '500'}}>Contact:</span>{' '}
                    <span style={{color: '#0f172a'}}>{selectedPatientData.phone || selectedPatientData.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Study Selection Section */}
          {selectedPatient && (
            <div className="form-section">
              <h2 className="form-section-title">Step 2: Select Study</h2>
              <p className="form-section-subtitle">Choose which scheduled study to upload files to</p>

              {loadingStudies ? (
                <div style={{padding: '40px', textAlign: 'center', color: 'var(--muted)'}}>
                  Loading studies...
                </div>
              ) : pendingStudies.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {pendingStudies.map((study) => {
                    const isSelected = selectedStudy?.id === study.id
                    const priorityClass = getPriorityBadgeClass(study.priority)
                    const priorityText = study.priority === 'stat' ? 'STAT' : 
                                       (study.priority || 'routine').charAt(0).toUpperCase() + (study.priority || 'routine').slice(1)

                    return (
                      <div
                        key={study.id}
                        onClick={() => handleStudySelect(study)}
                        style={{
                          padding: '16px',
                          border: `2px solid ${isSelected ? 'var(--brand)' : 'var(--line)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? '#f0f4ff' : 'white'
                        }}
                      >
                        <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                          <input 
                            type="radio" 
                            name="selectedStudy"
                            checked={isSelected}
                            onChange={() => handleStudySelect(study)}
                            style={{marginTop: '4px', cursor: 'pointer'}}
                          />
                          <div style={{flex: 1}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                              <strong style={{fontSize: '16px', color: isSelected ? 'var(--brand)' : 'var(--ink)'}}>
                                {study.study_id}
                              </strong>
                              <span className={`badge ${priorityClass}`}>{priorityText}</span>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--muted)'}}>
                              <div><strong>Exam Type:</strong> {study.exam_type || 'N/A'}</div>
                              <div><strong>Modality:</strong> {study.modality || 'N/A'}</div>
                              <div><strong>Scheduled:</strong> {formatDateTime(study.schedule)}</div>
                              <div><strong>Status:</strong> {study.status || 'pending'}</div>
                            </div>
                            {study.clinical_history && (
                              <div style={{marginTop: '8px', fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic'}}>
                                {study.clinical_history}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: '#fef3c7',
                  border: '1px solid #fde047',
                  borderRadius: '8px'
                }}>
                  <p style={{margin: '0 0 12px 0', color: '#854d0e', fontWeight: '600'}}>
                    No pending studies found for this patient
                  </p>
                  <p style={{margin: '0', fontSize: '14px', color: '#a16207'}}>
                    Please schedule an appointment first before uploading DICOM files.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/patients')}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      background: 'var(--brand)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Go to Patients to Schedule
                  </button>
                </div>
              )}
            </div>
          )}

          {/* File Upload Section */}
          {selectedStudy && (
            <div className="form-section">
              <h2 className="form-section-title">Step 3: Upload Files</h2>
              <p className="form-section-subtitle">Upload DICOM files (.dcm, .dicom, .zip) or additional files (.pdf, .jpg, .jpeg, .png)</p>

              {/* Drag and Drop Upload Area */}
              <div 
                className={`upload-zone ${dragActive ? 'drag-over' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input 
                  type="file" 
                  id="fileInput" 
                  multiple 
                  accept=".dcm,.dicom,.zip,.pdf,.jpg,.jpeg,.png" 
                  style={{display: 'none'}} 
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="upload-zone-content">
                  <span className="material-symbols-outlined" style={{fontSize: '64px', color: 'var(--brand)', marginBottom: '16px'}}>cloud_upload</span>
                  <h3 style={{margin: '0 0 8px 0', fontSize: '18px', color: 'var(--ink)'}}>
                    Drag & Drop Files
                  </h3>
                  <p style={{margin: '0 0 16px 0', color: 'var(--muted)'}}>or click to browse</p>
                  <button 
                    type="button" 
                    className="btn" 
                    id="browseBtn"
                    style={{background: 'var(--brand)', color: 'white', border: 'none'}}
                  >
                    Browse Files
                  </button>
                  <p style={{margin: '16px 0 0 0', fontSize: '12px', color: 'var(--muted)'}}>
                    Supported: .dcm, .dicom, .zip, .pdf, .jpg, .jpeg, .png (Max 2GB per file)
                  </p>
                </div>
              </div>

              {/* DICOM Files List */}
              {selectedFiles.length > 0 && (
                <div style={{display: 'block', marginTop: '20px'}}>
                  <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)'}}>
                    DICOM Files ({selectedFiles.length})
                  </h4>
                  <div style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px'}}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--line)'}}>
                        <div>
                          <div style={{fontWeight: 600, fontSize: '14px'}}>{file.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--muted)'}}>{formatFileSize(file.size)}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer'}}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Files List */}
              {selectedAdditionalFiles.length > 0 && (
                <div style={{display: 'block', marginTop: '20px'}}>
                  <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)'}}>
                    Additional Files ({selectedAdditionalFiles.length})
                  </h4>
                  <div style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px'}}>
                    {selectedAdditionalFiles.map((file, index) => (
                      <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--line)'}}>
                        <div>
                          <div style={{fontWeight: 600, fontSize: '14px'}}>{file.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--muted)'}}>{formatFileSize(file.size)}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeAdditionalFile(index)}
                          style={{color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer'}}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {selectedStudy && (
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="btn-create" 
                disabled={loading || (selectedFiles.length === 0 && selectedAdditionalFiles.length === 0)}
              >
                {loading ? 'Uploading...' : 'Upload Files to Study'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default UploadDicom