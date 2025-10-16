import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [pendingStudies, setPendingStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

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
    return status === 'pending' ? 'badge-pending' :
           status === 'reading' ? 'badge-reading' : 'badge-done'
  }

  const getPriorityBadgeClass = (priority) => {
    return priority === 'stat' ? 'badge-priority-stat' :
           priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
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
                  <th>Study ID</th>
                  <th>Patient</th>
                  <th>Files</th>
                  <th>Upload Date</th>
                  <th>Priority</th>
                  <th>Clinical History</th>
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
                    
                    const uploadDate = study.created_at ? new Date(study.created_at).toLocaleDateString() : 'N/A'
                    const fileCount = study.dicom_files ? study.dicom_files.length : 0
                    const clinicalHistory = study.clinical_history || 'None provided'
                    const truncatedHistory = clinicalHistory.length > 50 ? 
                      clinicalHistory.substring(0, 50) + '...' : clinicalHistory

                    return (
                      <tr 
                        key={study.id}
                        onClick={() => window.location.href = `/studies/${study.id}`}
                        style={{cursor: 'pointer'}}
                      >
                        <td data-label="Study ID">{study.study_id || 'N/A'}</td>
                        <td data-label="Patient">{patientName}</td>
                        <td data-label="Files">{fileCount} file(s)</td>
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
                  <th>Study ID</th>
                  <th>Patient</th>
                  <th>Exam Type</th>
                  <th>Appointment Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>Loading reports...</td>
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
                      const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      dateStr = `${datePart} ${timePart}`
                    }

                    return (
                      <tr 
                        key={report.id}
                        onClick={() => window.location.href = `/reports/${report.id}`}
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
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>
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
    </section>
  )
}

export default Reports
