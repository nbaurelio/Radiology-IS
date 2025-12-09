import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const Reports = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [reports, setReports] = useState([])
  const [pendingStudies, setPendingStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)
  const [showStudySelectionModal, setShowStudySelectionModal] = useState(false)
  const [selectedStudyForReport, setSelectedStudyForReport] = useState(null)

  useEffect(() => {
    loadPendingStudies()
    loadReports()
  }, [])

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        searchReports(searchTerm.trim())
      } else {
        loadReports()
      }
    }, 300)

    setSearchTimeout(timeout)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  const loadPendingStudies = async () => {
    try {
      const result = await studyService.getPendingStudies()
      if (result.success) {
        setPendingStudies(result.studies)
      }
    } catch (error) {
      console.error('Error loading pending studies:', error)
    }
  }

  const loadReports = async () => {
    try {
      const result = await reportService.getAllReports()
      if (result.success) {
        setReports(result.reports)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchReports = async (term) => {
    try {
      const result = await reportService.searchReports(term)
      if (result.success) {
        setReports(result.reports)
      }
    } catch (error) {
      console.error('Error searching reports:', error)
    }
  }

  const getBadgeClass = (status) => {
    return status === 'pending' ? 'badge-pending' :      // Yellow - Scheduled
          status === 'completed' ? 'badge-reading' :    // Blue - DICOM uploaded
          'badge-done'                                   // Green - Report finalized
  }

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
  }

  const handleDeleteClick = (e, report) => {
    e.stopPropagation()
    setReportToDelete(report)
    setDeleteConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!reportToDelete) return
    
    setLoading(true)
    try {
      const result = await reportService.deleteReport(reportToDelete.id)
      
      if (result.success) {
        addNotification(createNotification({
          type: 'report_deleted',
          title: '🗑️ Report Deleted',
          message: `Report for study ${reportToDelete.study_id} has been successfully deleted.`,
          priority: PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.RADIOLOGIST,
          autoRemove: false
        }))
        await loadReports()
      } else {
        addNotification(createNotification({
          type: 'report_delete_failed',
          title: '❌ Delete Failed',
          message: `Failed to delete report: ${result.message}`,
          priority: PRIORITY_LEVELS.URGENT,
          recipientRole: USER_ROLES.RADIOLOGIST,
          autoRemove: false
        }))
      }
    } catch (error) {
      console.error('Delete error:', error)
      addNotification(createNotification({
        type: 'report_delete_failed',
        title: '❌ Delete Error',
        message: 'An error occurred while deleting the report. Please try again.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.RADIOLOGIST,
        autoRemove: false
      }))
    } finally {
      setLoading(false)
      setDeleteConfirmModal(false)
      setReportToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmModal(false)
    setReportToDelete(null)
  }

  const handleAddReportClick = () => {
    setShowStudySelectionModal(true)
  }

  const handleStudySelect = (study) => {
    setSelectedStudyForReport(study)
  }

  const handleCreateReportFromStudy = () => {
    if (!selectedStudyForReport) {
      alert('Please select a study first')
      return
    }
    // Navigate to AddReport page with study_id as query parameter
    navigate(`/reports/add?study_id=${selectedStudyForReport.id}`)
  }

  const handleCancelStudySelection = () => {
    setShowStudySelectionModal(false)
    setSelectedStudyForReport(null)
  }

  return (
    <section className="grid">
      {/* Search Bar */}
      <article className="card search-bar">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by patient, study, or radiologist..." 
          />
        </div>
        <button 
          className="add-patient-btn" 
          onClick={handleAddReportClick}
          aria-label="Add Report"
        >
          <span className="plus-icon">+</span>
        </button>
      </article>

      {/* Pending Studies Section */}
      <article className="card table-card">
        <div className="hd">
          Pending Studies (<span>{pendingStudies.length}</span>)
          <p style={{margin: '4px 0 0 0', fontSize: '13px', fontWeight: 400, color: 'var(--muted)'}}>Studies awaiting report creation</p>
        </div>
        <div className="bd">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{width: '15%'}}>Study ID</th>
                  <th style={{width: '15%'}}>Patient</th>
                  <th style={{width: '10%'}}>Files</th>
                  <th style={{width: '23%'}}>Upload Date</th>
                  <th style={{width: '12%'}}>Priority</th>
                  <th style={{width: '25%'}}>Clinical History</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudies.length > 0 ? (
                  pendingStudies.map((study) => {
                    const patientName = study.patients ? 
                      `${study.patients.first_name} ${study.patients.last_name}` : 
                      'Unknown Patient'
                    
                    const priorityClass = getPriorityBadgeClass(study.priority)
                    const priorityText = study.priority === 'stat' ? 'STAT' : 
                                       (study.priority || 'routine').charAt(0).toUpperCase() + (study.priority || 'routine').slice(1)
                    
                    const uploadDate = study.created_at ? new Date(study.created_at).toLocaleString() : 'N/A'
                    const fileCount = study.dicom_files ? study.dicom_files.length : 0
                    const fileText = fileCount === 1 ? 'file' : 'files'
                    const clinicalHistory = study.clinical_history || 'None provided'
                    const truncatedHistory = clinicalHistory.length > 50 ? 
                      clinicalHistory.substring(0, 50) + '...' : clinicalHistory

                    return (
                      <tr 
                        key={study.id}
                        onClick={() => navigate(`/studies/${study.id}`)}
                        style={{cursor: 'pointer'}}
                      >
                        <td data-label="Study ID">{study.study_id || 'N/A'}</td>
                        <td data-label="Patient">{patientName}</td>
                        <td data-label="Files">
                          {fileCount > 0 ? (
                            <span style={{color: 'var(--ink)'}}>{fileCount} {fileText}</span>
                          ) : (
                            <span style={{color: 'var(--muted)'}}>No files</span>
                          )}
                        </td>
                        <td data-label="Upload Date">{uploadDate}</td>
                        <td data-label="Priority">
                          <span className={`badge ${priorityClass}`}>{priorityText}</span>
                        </td>
                        <td data-label="Clinical History">{truncatedHistory}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '24px'}}>
                      No pending studies. All studies have been reviewed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      {/* Reports List */}
      <article className="card table-card">
        <div className="hd">Radiology Reports (<span>{reports.length}</span>)</div>
        <div className="bd">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{width: '13%'}}>Study ID</th>
                  <th style={{width: '13%'}}>Patient</th>
                  <th style={{width: '10%'}}>Exam Type</th>
                  <th style={{width: '20%'}}>Appointment Date</th>
                  <th style={{width: '10%'}}>Priority</th>
                  <th style={{width: '10%'}}>Status</th>
                  <th style={{width: '12%'}}>Notes</th>
                  <th style={{width: '12%'}}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '24px'}}>Loading reports...</td>
                  </tr>
                ) : reports.length > 0 ? (
                  reports.map((report) => {
                    const patientName = report.patients ? 
                      `${report.patients.first_name} ${report.patients.last_name}` : 
                      (report.name || 'Unknown Patient')
                    
                    const studyId = report.study_id || 'N/A'
                    const statusClass = getBadgeClass(report.status)
                    const statusText = (report.status || 'pending').charAt(0).toUpperCase() + (report.status || 'pending').slice(1).toLowerCase()

                    const priority = report.priority || 'routine'
                    const priorityClass = getPriorityBadgeClass(priority)
                    const priorityText = priority === 'stat' ? 'STAT' : 
                                       priority.charAt(0).toUpperCase() + priority.slice(1)

                    let dateStr = 'N/A'
                    const dateToUse = report.study_date || report.schedule
                    if (dateToUse) {
                      const date = new Date(dateToUse)
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const year = date.getFullYear()
                      const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                      dateStr = `${month}/${day}/${year}, ${timePart}`
                    }

                    return (
                      <tr 
                        key={report.id}
                        onClick={() => navigate(`/reports/${report.id}`)}
                        style={{cursor: 'pointer'}}
                      >
                        <td data-label="Study ID">{studyId}</td>
                        <td data-label="Patient">{patientName}</td>
                        <td data-label="Exam Type">{report.exam_type || 'N/A'}</td>
                        <td data-label="Appointment Date">{dateStr}</td>
                        <td data-label="Priority">
                          <span className={`badge ${priorityClass}`}>{priorityText}</span>
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${statusClass}`}>{statusText}</span>
                        </td>
                        <td data-label="Notes">{report.notes || '-'}</td>
                        <td data-label="" style={{textAlign: 'right', paddingRight: '48px'}}>
                          <button
                            onClick={(e) => handleDeleteClick(e, report)}
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
                            title="Delete report"
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
                    <td colSpan="8" style={{textAlign: 'center', padding: '24px'}}>
                      {searchTerm 
                        ? 'No reports found matching your search.'
                        : 'No reports found. Click + to add a new report.'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      {/* Study Selection Modal */}
      {showStudySelectionModal && (
        <div
          className="modal"
          style={{
            display: 'flex',
            padding: '140px 20px 40px',
            alignItems: 'flex-start'
          }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '900px',
              margin: 'auto',
              maxHeight: '80vh'
            }}
          >
            <div className="modal-header">
              <div>
                <h2>Select Study for Report</h2>
                <p className="modal-subtitle">Choose a pending study to create a report</p>
              </div>
              <button className="close-btn" onClick={handleCancelStudySelection}>&times;</button>
            </div>
            <div className="modal-body" style={{padding: '0'}}>
              {pendingStudies.length > 0 ? (
                <div className="table-wrap" style={{maxHeight: '420px', overflowY: 'auto'}}>
                  <table className="tbl">
                    <thead style={{position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1}}>
                      <tr>
                        <th style={{width: '5%'}}></th>
                        <th style={{width: '15%'}}>Study ID</th>
                        <th style={{width: '18%'}}>Patient</th>
                        <th style={{width: '12%'}}>Exam Type</th>
                        <th style={{width: '10%'}}>Modality</th>
                        <th style={{width: '12%'}}>Priority</th>
                        <th style={{width: '20%'}}>Clinical History</th>
                        <th style={{width: '8%'}}>Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudies.map((study) => {
                        const patientName = study.patients ? 
                          `${study.patients.first_name} ${study.patients.last_name}` : 
                          'Unknown Patient'
                        
                        const priorityClass = getPriorityBadgeClass(study.priority)
                        const priorityText = study.priority === 'stat' ? 'STAT' : 
                                           (study.priority || 'routine').charAt(0).toUpperCase() + (study.priority || 'routine').slice(1)
                        
                        const fileCount = study.dicom_files ? study.dicom_files.length : 0
                        const clinicalHistory = study.clinical_history || 'None provided'
                        const truncatedHistory = clinicalHistory.length > 40 ? 
                          clinicalHistory.substring(0, 40) + '...' : clinicalHistory
                        
                        const isSelected = selectedStudyForReport?.id === study.id

                        return (
                          <tr 
                            key={study.id}
                            onClick={() => handleStudySelect(study)}
                            style={{
                              cursor: 'pointer',
                              background: isSelected ? '#e0e7ff' : 'transparent'
                            }}
                          >
                            <td style={{textAlign: 'center'}}>
                              <input 
                                type="radio" 
                                name="selectedStudy"
                                checked={isSelected}
                                onChange={() => handleStudySelect(study)}
                                style={{cursor: 'pointer'}}
                              />
                            </td>
                            <td data-label="Study ID">{study.study_id || 'N/A'}</td>
                            <td data-label="Patient">{patientName}</td>
                            <td data-label="Exam Type">{study.exam_type || 'N/A'}</td>
                            <td data-label="Modality">{study.modality || 'N/A'}</td>
                            <td data-label="Priority">
                              <span className={`badge ${priorityClass}`}>{priorityText}</span>
                            </td>
                            <td data-label="Clinical History" title={clinicalHistory}>{truncatedHistory}</td>
                            <td data-label="Files">{fileCount}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{padding: '40px 20px', textAlign: 'center'}}>
                  <p style={{color: 'var(--muted)', marginBottom: '16px'}}>
                    No pending studies available. All studies have been reviewed or have existing reports.
                  </p>
                  <button 
                    onClick={handleCancelStudySelection}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid var(--line)',
                      background: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
              {pendingStudies.length > 0 && (
                <div style={{padding: '20px', borderTop: '1px solid var(--line)', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  <button 
                    onClick={handleCancelStudySelection}
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
                    onClick={handleCreateReportFromStudy}
                    disabled={!selectedStudyForReport}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: selectedStudyForReport ? 'var(--brand)' : '#9ca3af',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: selectedStudyForReport ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Create Report
                  </button>
                </div>
              )}
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
                <h2>Delete Report</h2>
                <p className="modal-subtitle">Are you sure you want to delete this report?</p>
              </div>
              <button className="close-btn" onClick={cancelDelete}>&times;</button>
            </div>
            <div className="modal-body">
              {reportToDelete && (
                <div style={{marginBottom: '20px'}}>
                  <p style={{marginBottom: '8px'}}><strong>Study ID:</strong> {reportToDelete.study_id || 'N/A'}</p>
                  <p style={{marginBottom: '8px'}}><strong>Patient:</strong> {reportToDelete.patients ? `${reportToDelete.patients.first_name} ${reportToDelete.patients.last_name}` : reportToDelete.name || 'Unknown'}</p>
                  <p style={{marginBottom: '8px'}}><strong>Exam Type:</strong> {reportToDelete.exam_type || 'N/A'}</p>
                  <p style={{color: 'var(--error)', marginTop: '16px', fontSize: '14px'}}>
                    ⚠️ This action cannot be undone. The report will be permanently deleted.
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
                  {loading ? 'Deleting...' : 'Delete Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Reports