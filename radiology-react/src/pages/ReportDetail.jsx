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
              <h1 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
                Report #{report.study_id || id}
              </h1>
              <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
                Patient: {report.name || 'Unknown'}
              </p>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Study Information
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div><strong>Study ID:</strong> {report.study_id || 'N/A'}</div>
                    <div><strong>Exam Type:</strong> {report.exam_type || 'N/A'}</div>
                    <div><strong>Study Date:</strong> {report.study_date ? new Date(report.study_date).toLocaleDateString() : 'N/A'}</div>
                    <div>
                      <strong>Priority:</strong> 
                      <span className={`badge ${
                        report.priority === 'stat' ? 'badge-priority-stat' :
                        report.priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
                      }`} style={{marginLeft: '8px'}}>
                        {(report.priority || 'routine').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Report Status
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`badge ${
                        report.status === 'pending' ? 'badge-pending' :
                        report.status === 'reading' ? 'badge-reading' : 'badge-done'
                      }`} style={{marginLeft: '8px'}}>
                        {(report.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    <div><strong>Created:</strong> {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Radiologist:</strong> {report.assigned_radiologist || 'Unassigned'}</div>
                  </div>
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
