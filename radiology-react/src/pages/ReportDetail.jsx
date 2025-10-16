import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reportService } from '../services/reportService'

const ReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

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
    alert('Edit functionality coming soon!')
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

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Report Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
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

        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Report Content</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
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
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default ReportDetail
