import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/dashboard.css';

function Dashboard() {
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('Administrator');
  const [stats, setStats] = useState({
    totalStudies: 0,
    pendingReads: 0,
    urgentStudies: 0,
    activePatients: 0
  });
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [statusFilter, priorityFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    // Simulate loading data - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalStudies: 1247,
        pendingReads: 23,
        urgentStudies: 5,
        activePatients: 892
      });
      
      // Mock study data
      const mockStudies = [
        { id: 1, study_id: 'STD-2024-001', patient_name: 'John Doe', modality: 'CT', exam_type: 'Chest CT', date: '2024-10-15', priority: 'routine', status: 'completed' },
        { id: 2, study_id: 'STD-2024-002', patient_name: 'Jane Smith', modality: 'MRI', exam_type: 'Brain MRI', date: '2024-10-16', priority: 'urgent', status: 'pending' },
        { id: 3, study_id: 'STD-2024-003', patient_name: 'Bob Johnson', modality: 'X-Ray', exam_type: 'Chest X-Ray', date: '2024-10-16', priority: 'stat', status: 'reading' },
      ];
      
      let filtered = mockStudies;
      if (statusFilter) {
        filtered = filtered.filter(s => s.status === statusFilter);
      }
      if (priorityFilter) {
        filtered = filtered.filter(s => s.priority === priorityFilter);
      }
      
      setStudies(filtered);
      setLoading(false);
    }, 500);
  };

  const getBadgeClass = (value, type) => {
    if (type === 'priority') {
      if (value === 'stat') return 'badge-pending';
      if (value === 'urgent') return 'badge-reading';
      return 'badge-done';
    }
    if (type === 'status') {
      if (value === 'pending') return 'badge-pending';
      if (value === 'reading') return 'badge-reading';
      return 'badge-done';
    }
  };

  return (
    <>
      <Header activePage="dashboard" />
      
      <main className="container">
        <section className="grid">
          {/* Welcome Card */}
          <article className="card welcome">
            <div className="avatar-big" aria-hidden="true"></div>
            <div>
              <div className="pill">Welcome back, <span id="userName">{userName}</span></div>
              <h2 style={{ margin: '.5rem 0 0' }}>Happy to see you again on your dashboard.</h2>
              <p className="muted" style={{ margin: '.35rem 0 0' }}>
                <span id="userRole">{userRole}</span> | Here's a quick snapshot of your performance today.
              </p>
            </div>
          </article>

          {/* Metric Cards */}
          <section className="metrics">
            <article className="card metric">
              <h4>Total Studies</h4>
              <div className="val">{loading ? <div className="skeleton" style={{ width: '80px', height: '32px' }}></div> : stats.totalStudies.toLocaleString()}</div>
              <div className="mini-chart" aria-hidden="true"></div>
            </article>

            <article className="card metric">
              <h4>Pending Reads</h4>
              <div className="val">{loading ? <div className="skeleton" style={{ width: '80px', height: '32px' }}></div> : stats.pendingReads.toLocaleString()}</div>
              <div className="mini-chart" aria-hidden="true"></div>
            </article>

            <article className="card metric">
              <h4>Urgent Studies</h4>
              <div className="val">{loading ? <div className="skeleton" style={{ width: '80px', height: '32px' }}></div> : stats.urgentStudies.toLocaleString()}</div>
              <div className="mini-chart" aria-hidden="true"></div>
            </article>

            <article className="card metric">
              <h4>Active Patients</h4>
              <div className="val">{loading ? <div className="skeleton" style={{ width: '80px', height: '32px' }}></div> : stats.activePatients.toLocaleString()}</div>
              <div className="mini-chart" aria-hidden="true"></div>
            </article>
          </section>

          {/* Revenue Overview */}
          <article className="card overview">
            <div className="hd">Revenue Overview</div>
            <div className="bd">
              <div className="kpi" style={{ marginBottom: '10px' }}>
                <div className="item"><span className="muted">This month</span><b>$75,689</b></div>
                <div className="item"><span className="muted">Last month</span><b>$59,724</b></div>
                <div className="item"><span className="muted">Average</span><b>$66,561</b></div>
              </div>

              <svg className="chart" viewBox="0 0 600 180" role="img" aria-label="Revenue trend">
                <defs>
                  <linearGradient id="fillA" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="600" height="180" fill="none" stroke="var(--line)" />
                <g stroke="var(--line)" strokeWidth="1" opacity=".8">
                  <line x1="0" y1="40" x2="600" y2="40" />
                  <line x1="0" y1="80" x2="600" y2="80" />
                  <line x1="0" y1="120" x2="600" y2="120" />
                </g>
                <path d="M0,130 L30,115 60,128 90,90 120,110 150,85 180,92 210,70 240,80 270,65 300,78 330,60 360,75 390,68 420,82 450,72 480,89 510,95 540,85 570,92 600,88 L600,180 L0,180 Z"
                      fill="url(#fillA)" />
                <path d="M0,130 L30,115 60,128 90,90 120,110 150,85 180,92 210,70 240,80 270,65 300,78 330,60 360,75 390,68 420,82 450,72 480,89 510,95 540,85 570,92 600,88"
                      fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div className="legend" style={{ marginTop: '10px' }}>
                <span className="dot"></span><span className="muted">Returning</span>
                <span className="dot alt"></span><span className="muted">Newcomers</span>
              </div>
            </div>
          </article>

          {/* Recent Studies Table */}
          <article className="card table-card">
            <div className="hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Recent Studies</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  className="btn" 
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                </select>
                <select 
                  className="btn" 
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priority</option>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
                <button className="btn" style={{ padding: '6px 12px' }} onClick={loadDashboard}>↻ Refresh</button>
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
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>
                          <div className="skeleton" style={{ width: '100%', height: '20px', marginBottom: '10px' }}></div>
                          <div className="skeleton" style={{ width: '100%', height: '20px', marginBottom: '10px' }}></div>
                          <div className="skeleton" style={{ width: '100%', height: '20px' }}></div>
                        </td>
                      </tr>
                    ) : studies.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>
                          No studies found matching filters.
                        </td>
                      </tr>
                    ) : (
                      studies.map(study => (
                        <tr key={study.id}>
                          <td data-label="Study ID">{study.study_id}</td>
                          <td data-label="Patient">
                            <Link to={`/patients/${study.id}`} style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                              {study.patient_name}
                            </Link>
                          </td>
                          <td data-label="Modality">{study.modality}</td>
                          <td data-label="Exam Type">{study.exam_type}</td>
                          <td data-label="Date">{study.date}</td>
                          <td data-label="Priority">
                            <span className={`badge ${getBadgeClass(study.priority, 'priority')}`}>
                              {study.priority.toUpperCase()}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${getBadgeClass(study.status, 'status')}`}>
                              {study.status.toUpperCase()}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <a href="#" className="btn-grad" onClick={(e) => { e.preventDefault(); alert('Study viewer coming soon!'); }}>View</a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
