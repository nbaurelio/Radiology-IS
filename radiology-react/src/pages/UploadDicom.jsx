import React, { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { studyService } from '../services/studyService'
import { patientService } from '../services/patientService'

const UploadDicom = () => {
  const [studies, setStudies] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [clinicalHistory, setClinicalHistory] = useState('')
  const [examPriority, setExamPriority] = useState('routine')
  const [dragActive, setDragActive] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [studyToDelete, setStudyToDelete] = useState(null)

  useEffect(() => {
    loadStudies()
    loadPatients()
  }, [])

  const loadStudies = async () => {
    try {
      const result = await studyService.getRecentStudies()
      if (result.success) {
        setStudies(result.studies)
      }
    } catch (error) {
      console.error('Error loading studies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (e, study) => {
    e.stopPropagation()
    setStudyToDelete(study)
    setDeleteConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!studyToDelete) return
    
    setLoading(true)
    try {
      const result = await studyService.deleteStudy(studyToDelete.id, studyToDelete.study_id)
      
      if (result.success) {
        alert('Study deleted successfully')
        await loadStudies()
      } else {
        alert(`Error deleting study: ${result.message}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting the study')
    } finally {
      setLoading(false)
      setDeleteConfirmModal(false)
      setStudyToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmModal(false)
    setStudyToDelete(null)
  }

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
    const validFiles = []
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    const validExtensions = ['.dcm', '.dicom', '.zip']
    
    for (let file of fileList) {
      // Check file size
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 2GB limit and will be skipped.`)
        continue
      }
      
      // Check file extension
      const fileName = file.name.toLowerCase()
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
      
      if (!hasValidExtension) {
        alert(`File "${file.name}" has invalid extension. Only .dcm, .dicom, and .zip files are supported.`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles])
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
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
    
    if (selectedFiles.length === 0) {
      alert('Please select at least one DICOM file')
      return
    }
    
    setLoading(true)
    
    try {
      // Generate study ID
      const studyId = await studyService.generateStudyId()
      
      // Create study data
      const studyData = {
        study_id: studyId,
        patient_uuid: selectedPatient,
        clinical_history: clinicalHistory || null,
        priority: examPriority,
        status: 'pending'
      }
      
      const result = await studyService.createStudy(studyData)
      
      if (result.success) {
        // Upload files to storage and save records
        const uploadResult = await studyService.uploadDicomFiles(
          result.study.id,
          result.study.study_id,
          selectedFiles
        )
        
        if (uploadResult.success) {
          alert(`Study uploaded successfully!\nStudy ID: ${result.study.study_id}\nFiles: ${uploadResult.uploadedCount}/${selectedFiles.length}`)
        } else {
          alert(`Study created but file upload had issues:\n${uploadResult.message}`)
        }
        
        // Reset form and close modal
        setShowModal(false)
        setSelectedFiles([])
        setSelectedPatient('')
        setClinicalHistory('')
        setExamPriority('routine')
        
        // Reload studies list
        await loadStudies()
      } else {
        alert(`Error uploading study: ${result.message}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('An error occurred while uploading. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
  }

  const getBadgeClass = (status) => {
    return status === 'pending' ? 'badge-pending' :
           status === 'reading' ? 'badge-reading' : 'badge-done'
  }

  return (
    <>
      <section className="grid">
        {/* Search and Add Upload Bar */}
        <article className="card search-bar">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search studies by patient, study ID, or modality..." 
            />
          </div>
          <button 
            className="add-patient-btn" 
            onClick={() => setShowModal(true)}
            aria-label="Upload DICOM"
          >
            <span className="plus-icon">+</span>
          </button>
        </article>

        {/* Studies List */}
        <article className="card table-card">
          <div className="hd">DICOM Studies (<span>{studies.length}</span>)</div>
          <div className="bd">
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{width: '15%'}}>Study ID</th>
                    <th style={{width: '15%'}}>Patient</th>
                    <th style={{width: '18%'}}>Modality</th>
                    <th style={{width: '15%'}}>Study Date</th>
                    <th style={{width: '12%'}}>Priority</th>
                    <th style={{width: '12%'}}>Status</th>
                    <th style={{width: '13%'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>Loading studies...</td>
                    </tr>
                  ) : studies.length > 0 ? (
                    studies.map((study) => {
                      const patientName = study.patients ? 
                        `${study.patients.first_name} ${study.patients.last_name}` : 
                        'Unknown Patient'
                      
                      const priorityClass = getPriorityBadgeClass(study.priority)
                      const priorityText = study.priority === 'stat' ? 'STAT' : 
                                         (study.priority || 'routine').charAt(0).toUpperCase() + (study.priority || 'routine').slice(1)
                      
                      const statusClass = getBadgeClass(study.status)
                      const statusText = (study.status || 'pending').charAt(0).toUpperCase() + (study.status || 'pending').slice(1)
                      
                      const studyDate = study.created_at ? new Date(study.created_at).toLocaleDateString() : 'N/A'
                      
                      // Count DICOM files
                      const fileCount = study.dicom_files ? study.dicom_files.length : 0

                      return (
                        <tr 
                          key={study.id}
                          style={{cursor: 'pointer'}}
                        >
                          <td data-label="Study ID" onClick={() => window.location.href = `/studies/${study.id}`}>{study.study_id || 'N/A'}</td>
                          <td data-label="Patient" onClick={() => window.location.href = `/studies/${study.id}`}>{patientName}</td>
                          <td data-label="Modality" onClick={() => window.location.href = `/studies/${study.id}`}>DICOM ({fileCount} files)</td>
                          <td data-label="Study Date" onClick={() => window.location.href = `/studies/${study.id}`}>{studyDate}</td>
                          <td data-label="Priority" onClick={() => window.location.href = `/studies/${study.id}`}>
                            <span className={`badge ${priorityClass}`}>{priorityText}</span>
                          </td>
                          <td data-label="Status" onClick={() => window.location.href = `/studies/${study.id}`}>
                            <span className={`badge ${statusClass}`}>{statusText}</span>
                          </td>
                          <td data-label="" style={{textAlign: 'right', paddingRight: '48px'}}>
                            <button
                              onClick={(e) => handleDeleteClick(e, study)}
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
                              title="Delete study"
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
                      <td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>
                        No studies found. Click + to upload DICOM files.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Delete Study</h2>
                <p className="modal-subtitle">Are you sure you want to delete this study?</p>
              </div>
              <button className="close-btn" onClick={cancelDelete}>&times;</button>
            </div>
            <div className="modal-body">
              {studyToDelete && (
                <div style={{marginBottom: '20px'}}>
                  <p style={{marginBottom: '8px'}}><strong>Study ID:</strong> {studyToDelete.study_id}</p>
                  <p style={{marginBottom: '8px'}}><strong>Patient:</strong> {studyToDelete.patients ? `${studyToDelete.patients.first_name} ${studyToDelete.patients.last_name}` : 'Unknown'}</p>
                  <p style={{color: 'var(--error)', marginTop: '16px', fontSize: '14px'}}>
                    ⚠️ This action cannot be undone. All DICOM files associated with this study will be permanently deleted.
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
                  {loading ? 'Deleting...' : 'Delete Study'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload DICOM Modal */}
      {showModal && (
        <div className="modal" style={{display: 'flex', padding: '130px 20px 40px'}}>
          <div className="modal-content" style={{maxWidth: '800px', margin: 'auto', maxHeight: 'calc(100vh - 170px)', overflowY: 'auto'}}>
            <div className="modal-header">
              <div>
                <h2>Upload DICOM Study</h2>
                <p className="modal-subtitle">Upload DICOM files (.dcm, .dicom) or compressed archives (.zip)</p>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Patient Selection */}
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
                        onChange={(e) => setSelectedPatient(e.target.value)}
                      >
                        <option value="">Select a patient</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.patient_id} - {p.first_name} {p.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <small style={{color: 'var(--muted)', marginTop: '4px', display: 'block'}}>
                      Patient ID is required for study association
                    </small>
                  </div>
                </div>

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
                    accept=".dcm,.dicom,.zip" 
                    style={{display: 'none'}} 
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="upload-zone-content">
                    <span className="material-symbols-outlined" style={{fontSize: '64px', color: 'var(--brand)', marginBottom: '16px'}}>cloud_upload</span>
                    <h3 style={{margin: '0 0 8px 0', fontSize: '18px', color: 'var(--ink)'}}>
                      Drag & Drop DICOM Files
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
                      Supported: .dcm, .dicom, .zip (Max 2GB per file)
                    </p>
                  </div>
                </div>

                {/* File List */}
                {selectedFiles.length > 0 && (
                  <div style={{display: 'block', marginTop: '20px'}}>
                    <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)'}}>
                      Selected Files ({selectedFiles.length})
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

                {/* Study Metadata */}
                <div className="form-row" style={{marginTop: '20px'}}>
                  <div className="form-group">
                    <label htmlFor="clinicalHistory">Clinical History</label>
                    <div className="input-with-icon">
                      <span className="material-icons input-icon">notes</span>
                      <input 
                        type="text" 
                        id="clinicalHistory" 
                        className="form-input" 
                        placeholder="Ex: Suspected pneumonia"
                        value={clinicalHistory}
                        onChange={(e) => setClinicalHistory(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="examPriority">Exam Priority <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <span className="material-icons input-icon">priority_high</span>
                      <select 
                        id="examPriority" 
                        className="form-input" 
                        required
                        value={examPriority}
                        onChange={(e) => setExamPriority(e.target.value)}
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="stat">STAT</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-create" style={{marginTop: '20px'}}>
                  Upload Study
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UploadDicom
