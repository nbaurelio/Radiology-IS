import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/reports.css';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [patient, setPatient] = useState(null);
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    exam_type: '',
    priority: '',
    status: '',
    findings: '',
    impression: '',
    recommendations: '',
    notes: ''
  });

  useEffect(() => {
    if (!id) {
      navigate('/reports');
      return;
    }
    loadReportDetails();
  }, [id, navigate]);

  const loadReportDetails = async () => {
    setLoading(true);
    // Simulate loading - replace with actual API call
    setTimeout(() => {
      const mockReport = {
        id: id,
        report_id: 'RPT-2024-001',
        study_id: 'STD-2024-001',
        patient_uuid: '1',
        exam_type: 'Chest CT',
        report_date: '2024-10-16T10:30:00',
        priority: 'urgent',
        status: 'completed',
        radiologist: 'Dr. Sarah Johnson',
        findings: 'Bilateral infiltrates noted in the lower lobes. No pleural effusion. Heart size is normal. No pneumothorax.',
        impression: 'Findings consistent with bilateral pneumonia. Recommend follow-up imaging in 2-3 weeks after treatment.',
        recommendations: 'Follow-up chest X-ray in 2-3 weeks. Clinical correlation recommended. Consider antibiotic therapy.',
        notes: 'Patient reports persistent cough and fever for 2 weeks.',
        created_at: '2024-10-16T10:30:00',
        updated_at: '2024-10-16T10:30:00'
      };

      const mockPatient = {
        patient_id: 'PT-001',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1985-05-15',
        sex: 'male',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com'
      };

      const mockStudy = {
        study_id: 'STD-2024-001',
        modality: 'CT',
        study_date: '2024-10-15T09:30:00',
        clinical_history: 'Suspected pneumonia, persistent cough for 2 weeks',
        priority: 'urgent',
        file_count: 5
      };

      setReport(mockReport);
      setPatient(mockPatient);
      setStudy(mockStudy);
      setLoading(false);
    }, 500);
  };

  const handleEditReport = () => {
    setShowModal(true);
    setFormData({
      exam_type: report.exam_type || '',
      priority: report.priority || 'routine',
      status: report.status || 'pending',
      findings: report.findings || '',
      impression: report.impression || '',
      recommendations: report.recommendations || '',
      notes: report.notes || ''
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
    // Simulate update - replace with actual API call
    const updatedReport = {
      ...report,
      ...formData,
      updated_at: new Date().toISOString()
    };
    setReport(updatedReport);
    alert(`✅ Report updated successfully!\n\nReport ID: ${report.report_id}`);
    handleCloseModal();
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

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  };

  if (loading) {
    return (
      <>
        <Header activePage="reports" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading report details...</p>
        </main>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Header activePage="reports" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>Report not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activePage="reports" />
      
      <main className="container">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            onClick={handleEditReport}
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
            ✏️ Edit Report
          </button>
        </div>

        <section className="grid">
          {/* Report Information */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Report Information</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Report ID
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {report.report_id}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Study ID
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {report.study_id}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Exam Type
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {report.exam_type}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Report Date
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {formatDateTime(report.report_date)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Priority
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      <span className={`badge ${getPriorityBadgeClass(report.priority)}`}>
                        {report.priority === 'stat' ? 'STAT' : report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Status
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Radiologist
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {report.radiologist}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Patient Information */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Patient Information</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                {patient ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, width: '30%' }}>Patient ID</td>
                        <td style={{ padding: '12px' }}>{patient.patient_id}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Full Name</td>
                        <td style={{ padding: '12px' }}>{`${patient.first_name} ${patient.last_name}`}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Date of Birth</td>
                        <td style={{ padding: '12px' }}>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Sex</td>
                        <td style={{ padding: '12px' }}>{patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Contact</td>
                        <td style={{ padding: '12px' }}>
                          {patient.phone && `Phone: ${patient.phone}`}<br />
                          {patient.email && `Email: ${patient.email}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Patient information not available</p>
                )}
              </div>
            </div>
          </article>

          {/* Study Details */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Study Details</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                {study ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, width: '30%' }}>Study ID</td>
                        <td style={{ padding: '12px' }}>{study.study_id}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Modality</td>
                        <td style={{ padding: '12px' }}>{study.modality}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Study Date</td>
                        <td style={{ padding: '12px' }}>{formatDateTime(study.study_date)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Clinical History</td>
                        <td style={{ padding: '12px' }}>{study.clinical_history || 'No clinical history provided'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Priority</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${getPriorityBadgeClass(study.priority)}`}>
                            {study.priority === 'stat' ? 'STAT' : study.priority.charAt(0).toUpperCase() + study.priority.slice(1)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Number of Files</td>
                        <td style={{ padding: '12px' }}>{study.file_count} DICOM file(s)</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Study information not available</p>
                )}
              </div>
            </div>
          </article>

          {/* Report Findings & Notes */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Report Findings & Notes</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase' }}>
                    Findings
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--ink)' }}>
                    {report.findings || 'No findings recorded'}
                  </p>
                </div>

                <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase' }}>
                    Impression
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--ink)' }}>
                    {report.impression || 'No impression recorded'}
                  </p>
                </div>

                <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase' }}>
                    Recommendations
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--ink)' }}>
                    {report.recommendations || 'No recommendations'}
                  </p>
                </div>

                {report.notes && (
                  <>
                    <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase' }}>
                        Additional Notes
                      </h4>
                      <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--muted)' }}>
                        {report.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </article>
        </section>
      </main>

      {/* Edit Report Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && handleCloseModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2>Edit Report</h2>
              <p className="modal-subtitle">Update report details</p>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exam_type">Exam Type <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🏥</span>
                    <input 
                      type="text" 
                      id="exam_type" 
                      name="exam_type"
                      className="form-input" 
                      placeholder="Ex: Chest CT, Brain MRI" 
                      required
                      value={formData.exam_type}
                      onChange={handleInputChange}
                    />
                  </div>
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
                  <label htmlFor="status">Status <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">📊</span>
                    <select 
                      id="status" 
                      name="status"
                      className="form-input" 
                      required
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                    </select>
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
                    style={{ minHeight: '120px', resize: 'vertical', padding: '12px 16px' }}
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
                    style={{ minHeight: '100px', resize: 'vertical', padding: '12px 16px' }}
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
                    style={{ minHeight: '100px', resize: 'vertical', padding: '12px 16px' }}
                    value={formData.recommendations}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea 
                    id="notes" 
                    name="notes"
                    className="form-input" 
                    placeholder="Additional notes..."
                    style={{ minHeight: '80px', resize: 'vertical', padding: '12px 16px' }}
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn" 
                  style={{ border: '1px solid var(--card-border)', padding: '12px 24px', borderRadius: '12px', background: 'var(--panel)', color: 'var(--ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-create"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportDetail;
