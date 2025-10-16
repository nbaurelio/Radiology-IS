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
      return value === 'pending' ? 'badge-pending' :
             value === 'reading' ? 'badge-reading' : 'badge-done'
    }
    return 'badge-done'
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
          <div className="mini-chart" aria-hidden="true"></div>
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
          <div className="mini-chart" aria-hidden="true"></div>
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
          <div className="mini-chart" aria-hidden="true"></div>
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
          <div className="mini-chart" aria-hidden="true"></div>
        </article>
      </section>

      {/* Overview / chart */}
      <article className="card overview">
        <div className="hd">Revenue Overview</div>
        <div className="bd">
          <div className="kpi" style={{marginBottom:'10px'}}>
            <div className="item"><span className="muted">This month</span><b>$75,689</b></div>
            <div className="item"><span className="muted">Last month</span><b>$59,724</b></div>
            <div className="item"><span className="muted">Average</span><b>$66,561</b></div>
          </div>

          <svg className="chart" viewBox="0 0 600 180" role="img" aria-label="Revenue trend">
            <defs>
              <linearGradient id="fillA" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="600" height="180" fill="none" stroke="var(--line)"/>
            <g stroke="var(--line)" strokeWidth="1" opacity=".8">
              <line x1="0" y1="40" x2="600" y2="40"/>
              <line x1="0" y1="80" x2="600" y2="80"/>
              <line x1="0" y1="120" x2="600" y2="120"/>
            </g>
            <path d="M0,130 L30,115 60,128 90,90 120,110 150,85 180,92 210,70 240,80 270,65 300,78 330,60 360,75 390,68 420,82 450,72 480,89 510,95 540,85 570,92 600,88 L600,180 L0,180 Z"
                  fill="url(#fillA)"/>
            <path d="M0,130 L30,115 60,128 90,90 120,110 150,85 180,92 210,70 240,80 270,65 300,78 330,60 360,75 390,68 420,82 450,72 480,89 510,95 540,85 570,92 600,88"
                  fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div className="legend" style={{marginTop:'10px'}}>
            <span className="dot"></span><span className="muted">Returning</span>
            <span className="dot alt"></span><span className="muted">Newcomers</span>
          </div>
        </div>
      </article>

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
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
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
                  <th>Actions</th>
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
                        <td data-label="Modality">N/A</td>
                        <td data-label="Exam Type">N/A</td>
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
                        <td data-label="Actions">
                          <a 
                            href="#" 
                            className="btn-grad" 
                            onClick={(e) => { e.preventDefault(); alert('Study viewer coming soon!'); }}
                          >
                            View
                          </a>
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
