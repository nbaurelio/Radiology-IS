import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { studyService } from '../services/studyService'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudies: 0,
    pendingReads: 0,
    urgentStudies: 0,
    activePatients: 0
  })
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    loadStudies()
  }, [statusFilter, priorityFilter])

  const loadDashboard = async () => {
    try {
      const statsResult = await studyService.getDashboardStats()
      if (statsResult.success) {
        setStats(statsResult.stats)
      }
      await loadStudies()
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudies = async () => {
    try {
      const studiesResult = await studyService.getRecentStudies(50)
      
      if (studiesResult.success) {
        let filteredStudies = studiesResult.studies

        if (statusFilter) {
          filteredStudies = filteredStudies.filter(s => 
            (s.status || '').toLowerCase() === statusFilter
          )
        }
        if (priorityFilter) {
          filteredStudies = filteredStudies.filter(s => 
            (s.priority || '').toLowerCase() === priorityFilter
          )
        }

        setStudies(filteredStudies)
      }
    } catch (error) {
      console.error('Error loading studies:', error)
    }
  }

  const getBadgeClass = (type, value) => {
    if (type === 'priority') {
      return value === 'stat' ? 'badge-pending' : 
            value === 'urgent' ? 'badge-reading' : 'badge-done'
    }
    if (type === 'status') {
      return value === 'pending' ? 'badge-pending' :      // Yellow - Scheduled, awaiting upload
            value === 'completed' ? 'badge-reading' :    // Blue - DICOM uploaded, awaiting report
            'badge-done'                                  // Green - Report finalized
    }
    return 'badge-done'
  }

  // Generate a small numeric series ending with `value` for a simple sparkline
  const makeSeries = (value, length = 6) => {
    const base = Math.max(0, Math.round(value / Math.max(1, length)));
    const series = []
    for (let i = 0; i < length; i++) {
      // progressively increase values so the last point equals `value`
      const factor = 0.4 + (i / (length - 1)) * 0.6
      series.push(Math.round(base * factor * length))
    }
    // Ensure final value is the actual value (or at least close)
    series[series.length - 1] = Math.round(value)
    return series
  }

  // Build an SVG path string for a sparkline given numeric `values`
  const buildSparklinePath = (values, w = 140, h = 36, pad = 4) => {
    if (!values || values.length === 0) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const step = (w - pad * 2) / Math.max(1, values.length - 1)
    const points = values.map((v, i) => {
      const x = pad + i * step
      const y = pad + (1 - (v - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    const lineD = `M${points.join(' L')}`
    const fillD = `${lineD} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`
    return { lineD, fillD }
  }

  return (
    <section className="grid">
      {/* Welcome */}
      <article className="card welcome">
        <div className="avatar-big" aria-hidden="true"></div>
        <div>
          <div className="pill">Welcome back, <span>{user?.firstName}</span></div>
          <h2 style={{margin:'.5rem 0 0'}}>Happy to see you again on your dashboard.</h2>
          <p className="muted" style={{margin:'.35rem 0 0'}}>
            <span>{user?.userType}</span> | Here's a quick snapshot of your performance today.
          </p>
        </div>
      </article>

      {/* Metric cards */}
      <section className="metrics">
        <article className="card metric">
          <h4>Total Studies</h4>
          <div className="val">
            {loading ? (
              <div className="skeleton" style={{width: '80px', height: '32px'}}></div>
            ) : (
              stats.totalStudies.toLocaleString()
            )}
          </div>
          {/* mini-chart removed */}
        </article>

        <article className="card metric">
          <h4>Pending Reads</h4>
          <div className="val">
            {loading ? (
              <div className="skeleton" style={{width: '80px', height: '32px'}}></div>
            ) : (
              stats.pendingReads.toLocaleString()
            )}
          </div>
          {/* mini-chart removed */}
        </article>

        <article className="card metric">
          <h4>Urgent Studies</h4>
          <div className="val">
            {loading ? (
              <div className="skeleton" style={{width: '80px', height: '32px'}}></div>
            ) : (
              stats.urgentStudies.toLocaleString()
            )}
          </div>
          {/* mini-chart removed */}
        </article>

        <article className="card metric">
          <h4>Active Patients</h4>
          <div className="val">
            {loading ? (
              <div className="skeleton" style={{width: '80px', height: '32px'}}></div>
            ) : (
              stats.activePatients.toLocaleString()
            )}
          </div>
          {/* mini-chart removed */}
        </article>
      </section>

      {/* Revenue Overview card removed as requested */}

      {/* Recent Studies */}
      <article className="card table-card">
        <div className="hd" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>Recent Studies</span>
          <div style={{display: 'flex', gap: '8px'}}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="btn" 
              style={{padding: '6px 10px', fontSize: '13px'}}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="finalized">Finalized</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="btn" 
              style={{padding: '6px 10px', fontSize: '13px'}}
            >
              <option value="">All Priority</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
            <button className="btn" onClick={loadDashboard} style={{padding: '6px 12px'}}>↻ Refresh</button>
          </div>
        </div>
        <div className="bd">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Study ID</th>
                  <th>Patient</th>
                  <th>Modality</th>
                  <th>Exam Type</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '24px'}}>
                      <div className="skeleton" style={{width: '100%', height: '20px', marginBottom: '10px'}}></div>
                      <div className="skeleton" style={{width: '100%', height: '20px', marginBottom: '10px'}}></div>
                      <div className="skeleton" style={{width: '100%', height: '20px'}}></div>
                    </td>
                  </tr>
                ) : studies.length > 0 ? (
                  studies.map((study) => {
                    const patientName = study.patients
                      ? `${study.patients.first_name || ''} ${study.patients.last_name || ''}`.trim() || 'Unknown'
                      : 'Unknown Patient'
                    
                    const studyDate = new Date(study.created_at).toLocaleDateString()

                    return (
                      <tr key={study.study_id}>
                        <td data-label="Study ID">{study.study_id || 'N/A'}</td>
                        <td data-label="Patient">
                          <Link
                            to={`/patients/${study.patient_uuid}`}
                            style={{color: 'var(--brand)', textDecoration: 'none'}}
                          >
                            {patientName}
                          </Link>
                        </td>
                        <td data-label="Modality">{study.modality || 'N/A'}</td>
                        <td data-label="Exam Type">{study.exam_type || 'N/A'}</td>
                        <td data-label="Date">{studyDate}</td>
                        <td data-label="Priority">
                          <span className={`badge ${getBadgeClass('priority', study.priority)}`}>
                            {(study.priority || 'routine').toUpperCase()}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${getBadgeClass('status', study.status)}`}>
                            {(study.status || 'pending').toUpperCase()}
                          </span>
                        </td>

                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '24px'}}>
                      {statusFilter || priorityFilter 
                        ? 'No studies found matching filters.'
                        : 'No studies found. Upload DICOM files to get started.'
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

export default Dashboard
