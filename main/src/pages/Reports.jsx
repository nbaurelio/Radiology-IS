import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/reports.css';

function Reports() {
  const navigate = useNavigate();
  const [pendingStudies, setPendingStudies] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    study_id: '',
    exam_type: '',
    findings: '',
    impression: '',
    recommendations: '',
    priority: 'routine'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Simulate loading data - replace with actual API calls
    setTimeout(() => {
      // Mock pending studies data
      const mockPendingStudies = [
        {
          id: 1,
          study_id: 'STD-2024-001',
          patient_name: 'John Doe',
          file_count: 5,
          upload_date: '2024-10-15',
          priority: 'urgent',
          clinical_history: 'Suspected pneumonia, persistent cough for 2 weeks'
        },
        {
          id: 2,
          study_id: 'STD-2024-002',
          patient_name: 'Jane Smith',
          file_count: 3,
          upload_date: '2024-10-16',
          priority: 'stat',
          clinical_history: 'Acute chest pain, rule out MI'
        },
        {
          id: 3,
          study_id: 'STD-2024-003',
          patient_name: 'Bob Johnson',
          file_count: 8,
          upload_date: '2024-10-16',
          priority: 'routine',
          clinical_history: 'Follow-up scan for previous findings'
        },
      ];

      // Mock reports data
      const mockReports = [
        {
          id: 1,
          study_id: 'STD-2024-100',
          patient_name: 'Alice Williams',
          exam_type: 'Chest CT',
          appointment_date: '2024-10-14T09:30:00',
          priority: 'routine',
          status: 'completed',
          notes: 'Normal findings'
        },
        {
          id: 2,
          study_id: 'STD-2024-101',
          patient_name: 'Charlie Brown',
          exam_type: 'Brain MRI',
          appointment_date: '2024-10-15T14:00:00',
          priority: 'urgent',
          status: 'reading',
          notes: 'Under review'
        },
        {
          id: 3,
          study_id: 'STD-2024-102',
          patient_name: 'Diana Prince',
          exam_type: 'Abdominal X-Ray',
          appointment_date: '2024-10-16T10:15:00',
          priority: 'stat',
          status: 'pending',
          notes: 'Awaiting radiologist'
        },
      ];

      setPendingStudies(mockPendingStudies);
      setReports(mockReports);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateReport = () => {
    setShowModal(true);
    setFormData({
      study_id: '',
      exam_type: '',
      findings: '',
      impression: '',
      recommendations: '',
      priority: 'routine'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: reports.length + 1,
      report_id: `RPT-2024-${String(reports.length + 1).padStart(3, '0')}`,
      patient_name: 'New Patient',
      appointment_date: new Date().toISOString(),
      status: 'completed',
      notes: 'Report created',
      ...formData
    };
    setReports([...reports, newReport]);
    alert(`✅ Report created successfully!\n\nReport ID: ${newReport.report_id}\nStudy ID: ${formData.study_id}`);
    handleCloseModal();
  };

  const handleStudyClick = (studyId) => {
    navigate(`/upload/${studyId}`);
  };

  const handleReportClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'stat') return 'badge-priority-stat';
    if (priority === 'urgent') return 'badge-priority-urgent';
    return 'badge-priority-routine';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'pending') return 'badge-pending';
    if (status === 'reading') return 'badge-reading';
    return 'badge-done';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  };

  const filteredPendingStudies = pendingStudies.filter(study => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      study.study_id.toLowerCase().includes(search) ||
      study.patient_name.toLowerCase().includes(search) ||
      study.clinical_history.toLowerCase().includes(search)
    );
  });

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      report.study_id.toLowerCase().includes(search) ||
      report.patient_name.toLowerCase().includes(search) ||
      report.exam_type.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Header activePage="reports" />
      
      <main className="container">
        <section className="grid">
          {/* Search Bar */}
          <article className="card search-bar">
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                id="searchInput" 
                placeholder="Search reports by patient, study, or radiologist..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button 
              className="add-patient-btn" 
              onClick={handleCreateReport} 
              aria-label="Create Report"
              title="Create Report"
            >
              <span className="plus-icon">+</span>
            </button>
          </article>

          {/* Pending Studies Section */}
          <article className="card table-card">
            <div className="hd">
              Pending Studies (<span id="pendingCount">{filteredPendingStudies.length}</span>)
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 400, color: 'var(--muted)' }}>
                Studies awaiting report creation
              </p>
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
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                          Loading pending studies...
                        </td>
                      </tr>
                    ) : filteredPendingStudies.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                          No pending studies. All studies have been reviewed.
                        </td>
                      </tr>
                    ) : (
                      filteredPendingStudies.map(study => {
                        const truncatedHistory = study.clinical_history.length > 50 
                          ? study.clinical_history.substring(0, 50) + '...' 
                          : study.clinical_history;
                        
                        return (
                          <tr key={study.id} onClick={() => handleStudyClick(study.study_id)}>
                            <td data-label="Study ID">{study.study_id}</td>
                            <td data-label="Patient">{study.patient_name}</td>
                            <td data-label="Files">{study.file_count} file(s)</td>
                            <td data-label="Upload Date">{new Date(study.upload_date).toLocaleDateString()}</td>
                            <td data-label="Priority">
                              <span className={`badge ${getPriorityBadgeClass(study.priority)}`}>
                                {study.priority === 'stat' ? 'STAT' : study.priority.charAt(0).toUpperCase() + study.priority.slice(1)}
                              </span>
                            </td>
                            <td data-label="Clinical History">{truncatedHistory}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          {/* Reports List */}
          <article className="card table-card">
            <div className="hd">Radiology Reports (<span id="reportCount">{filteredReports.length}</span>)</div>
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
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                          Loading reports...
                        </td>
                      </tr>
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                          No reports found.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map(report => (
                        <tr key={report.id} onClick={() => handleReportClick(report.id)}>
                          <td data-label="Study ID">{report.study_id}</td>
                          <td data-label="Patient">{report.patient_name}</td>
                          <td data-label="Exam Type">{report.exam_type}</td>
                          <td data-label="Appointment Date">{formatDateTime(report.appointment_date)}</td>
                          <td data-label="Priority">
                            <span className={`badge ${getPriorityBadgeClass(report.priority)}`}>
                              {report.priority === 'stat' ? 'STAT' : report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </td>
                          <td data-label="Notes">{report.notes || '-'}</td>
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

      {/* Create Report Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && handleCloseModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2>Create New Report</h2>
              <p className="modal-subtitle">Enter report details</p>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="study_id">Study ID <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🆔</span>
                    <input 
                      type="text" 
                      id="study_id" 
                      name="study_id"
                      className="form-input" 
                      placeholder="Ex: STD-2024-001" 
                      required
                      value={formData.study_id}
                      onChange={handleInputChange}
                    />
                  </div>
                  <small style={{ color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Enter the Study ID for this report
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">⚠️</span>
                    <select 
                      id="priority" 
                      name="priority"
                      className="form-input" 
                      required
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="exam_type">Exam Type <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🏥</span>
                    <input 
                      type="text" 
                      id="exam_type" 
                      name="exam_type"
                      className="form-input" 
                      placeholder="Ex: Chest CT, Brain MRI, Abdominal X-Ray" 
                      required
                      value={formData.exam_type}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="findings">Findings <span className="required">*</span></label>
                  <textarea 
                    id="findings" 
                    name="findings"
                    className="form-input" 
                    placeholder="Describe the radiological findings..."
                    style={{ minHeight: '100px', resize: 'vertical', padding: '12px 16px' }}
                    required
                    value={formData.findings}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="impression">Impression <span className="required">*</span></label>
                  <textarea 
                    id="impression" 
                    name="impression"
                    className="form-input" 
                    placeholder="Clinical impression and diagnosis..."
                    style={{ minHeight: '80px', resize: 'vertical', padding: '12px 16px' }}
                    required
                    value={formData.impression}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="recommendations">Recommendations</label>
                  <textarea 
                    id="recommendations" 
                    name="recommendations"
                    className="form-input" 
                    placeholder="Clinical recommendations and follow-up..."
                    style={{ minHeight: '80px', resize: 'vertical', padding: '12px 16px' }}
                    value={formData.recommendations}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn-create" style={{ marginTop: '20px' }}>
                Create Report
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
