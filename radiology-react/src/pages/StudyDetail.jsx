import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { studyService } from '../services/studyService'

const StudyDetail = () => {
  const { id } = useParams()
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

  return (
    <div className="container">
      <div style={{marginBottom: '20px'}}>
        <Link 
          to="/dashboard" 
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
            textDecoration: 'none',
            width: 'fit-content'
          }}
        >
          ← Back to Studies
        </Link>
      </div>

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Study Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              <h1 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
                Study #{study.study_id}
              </h1>
              <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
                Patient: {patientName}
              </p>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Study Details
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div><strong>Study ID:</strong> {study.study_id}</div>
                    <div><strong>Upload Date:</strong> {new Date(study.created_at).toLocaleDateString()}</div>
                    <div>
                      <strong>Priority:</strong> 
                      <span className={`badge ${
                        study.priority === 'stat' ? 'badge-priority-stat' :
                        study.priority === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-routine'
                      }`} style={{marginLeft: '8px'}}>
                        {(study.priority || 'routine').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`badge ${
                        study.status === 'pending' ? 'badge-pending' :
                        study.status === 'reading' ? 'badge-reading' : 'badge-done'
                      }`} style={{marginLeft: '8px'}}>
                        {(study.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Clinical Information
                  </h3>
                  <div>
                    <strong>Clinical History:</strong>
                    <p style={{marginTop: '4px', color: 'var(--muted)'}}>
                      {study.clinical_history || 'None provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Files
                  </h3>
                  <div>
                    <strong>DICOM Files:</strong> {study.dicom_files?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">DICOM Files</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              {study.dicom_files && study.dicom_files.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {study.dicom_files.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px', 
                      border: '1px solid var(--line)', 
                      borderRadius: '8px',
                      background: 'var(--bg)'
                    }}>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '14px'}}>
                          {file.file_name || `DICOM File ${index + 1}`}
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--muted)'}}>
                          {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          className="btn" 
                          onClick={() => alert('DICOM viewer coming soon!')}
                          style={{padding: '6px 12px', fontSize: '12px'}}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn" 
                          onClick={() => alert('Download functionality coming soon!')}
                          style={{padding: '6px 12px', fontSize: '12px'}}
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{textAlign: 'center', color: 'var(--muted)', padding: '40px 20px'}}>
                  No DICOM files found for this study.
                </p>
              )}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default StudyDetail
