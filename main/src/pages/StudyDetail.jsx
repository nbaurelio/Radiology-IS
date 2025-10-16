import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/upload.css';

function StudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [patient, setPatient] = useState(null);
  const [dicomFiles, setDicomFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [existingReport, setExistingReport] = useState(null);
  const [formData, setFormData] = useState({
    exam_type: '',
    findings: '',
    impression: '',
    recommendations: '',
    priority: 'routine'
  });

  useEffect(() => {
    if (!id) {
      navigate('/reports');
      return;
    }
    loadStudyDetails();
  }, [id, navigate]);

  const loadStudyDetails = async () => {
    setLoading(true);
    // Simulate loading - replace with actual API call
    setTimeout(() => {
      const mockStudy = {
        id: id,
        study_id: 'STD-2024-001',
        patient_uuid: '1',
        upload_date: '2024-10-15T09:30:00',
        priority: 'urgent',
        status: 'pending',
        clinical_history: 'Suspected pneumonia, persistent cough for 2 weeks',
        modality: 'CT',
        created_by: 'Dr. Smith',
        created_at: '2024-10-15T09:30:00'
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

      const mockFiles = [
        { id: 1, name: 'chest_ct_001.dcm', size: 2048576, status: 'uploaded', upload_date: '2024-10-15T09:30:00' },
        { id: 2, name: 'chest_ct_002.dcm', size: 2097152, status: 'uploaded', upload_date: '2024-10-15T09:31:00' },
        { id: 3, name: 'chest_ct_003.dcm', size: 1998848, status: 'uploaded', upload_date: '2024-10-15T09:32:00' },
        { id: 4, name: 'chest_ct_004.dcm', size: 2145728, status: 'uploaded', upload_date: '2024-10-15T09:33:00' },
        { id: 5, name: 'chest_ct_005.dcm', size: 2001920, status: 'uploaded', upload_date: '2024-10-15T09:34:00' }
      ];

      // Check if this study has an existing report
      // In production, this would be an API call
      const mockExistingReport = mockStudy.status === 'completed' ? {
        report_id: 'RPT-2024-001',
        exam_type: 'Chest CT',
        findings: 'Bilateral infiltrates noted in the lower lobes.',
        impression: 'Findings consistent with bilateral pneumonia.',
        recommendations: 'Follow-up chest X-ray in 2-3 weeks.',
        priority: mockStudy.priority
      } : null;

      setStudy(mockStudy);
      setPatient(mockPatient);
      setDicomFiles(mockFiles);
      setExistingReport(mockExistingReport);
      setLoading(false);
    }, 500);
  };

  const handleCreateReport = () => {
    setShowModal(true);
    if (existingReport) {
      // Edit mode - pre-fill with existing data
      setFormData({
        exam_type: existingReport.exam_type || '',
        findings: existingReport.findings || '',
        impression: existingReport.impression || '',
        recommendations: existingReport.recommendations || '',
        priority: existingReport.priority || 'routine'
      });
    } else {
      // Create mode - empty form
      setFormData({
        exam_type: '',
        findings: '',
        impression: '',
        recommendations: '',
        priority: study?.priority || 'routine'
      });
    }
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
    if (existingReport) {
      // Update existing report
      alert(`✅ Report updated successfully!\n\nReport ID: ${existingReport.report_id}\nStudy ID: ${study.study_id}\n\nThe report has been updated.`);
      setExistingReport({ ...existingReport, ...formData });
    } else {
      // Create new report
      const reportId = `RPT-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      alert(`✅ Report created successfully!\n\nReport ID: ${reportId}\nStudy ID: ${study.study_id}\n\nThe report has been added to the system.`);
      const newReport = { report_id: reportId, ...formData };
      setExistingReport(newReport);
    }
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

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
        <Header activePage="upload" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading study details...</p>
        </main>
      </>
    );
  }

  if (!study) {
    return (
      <>
        <Header activePage="upload" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>Study not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activePage="upload" />
      
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
            onClick={handleCreateReport}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '12px', 
              background: existingReport ? 'var(--panel)' : 'linear-gradient(135deg, var(--brand), #7a5af8)', 
              color: existingReport ? 'var(--ink)' : 'white', 
              cursor: 'pointer', 
              fontFamily: 'inherit', 
              fontSize: '15px', 
              fontWeight: 700,
              boxShadow: existingReport ? 'none' : '0 6px 16px rgba(109,93,252,.25)',
              border: existingReport ? '1px solid var(--card-border)' : 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {existingReport ? '✏️ Edit Report' : '➡️ Create Report'}
          </button>
        </div>

        <section className="grid">
          {/* Study Information */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Study Information</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, width: '30%' }}>Study ID</td>
                      <td style={{ padding: '12px' }}>{study.study_id}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Upload Date</td>
                      <td style={{ padding: '12px' }}>{formatDateTime(study.upload_date)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Priority</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${getPriorityBadgeClass(study.priority)}`}>
                          {study.priority === 'stat' ? 'STAT' : study.priority.charAt(0).toUpperCase() + study.priority.slice(1)}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Status</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${getStatusBadgeClass(study.status)}`}>
                          {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Modality</td>
                      <td style={{ padding: '12px' }}>{study.modality || 'N/A'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Clinical History</td>
                      <td style={{ padding: '12px' }}>{study.clinical_history || 'No clinical history provided'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Uploaded By</td>
                      <td style={{ padding: '12px' }}>{study.created_by || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Number of Files</td>
                      <td style={{ padding: '12px' }}>{dicomFiles.length} file(s)</td>
                    </tr>
                  </tbody>
                </table>
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

          {/* DICOM Files */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">DICOM Files ({dicomFiles.length})</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                {dicomFiles.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No DICOM files found</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dicomFiles.map((file, index) => (
                      <div 
                        key={file.id}
                        className="file-item"
                        style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--panel)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <span style={{ fontSize: '24px' }}>📄</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
                                {file.name}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                Size: {formatFileSize(file.size)} | Uploaded: {formatDateTime(file.upload_date)}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-done">Uploaded</span>
                            <button 
                              style={{ 
                                padding: '6px 12px', 
                                border: '1px solid var(--card-border)', 
                                borderRadius: '6px', 
                                background: 'var(--panel)', 
                                color: 'var(--ink)', 
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                              onClick={() => alert(`Download ${file.name} - Feature coming soon`)}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <h2>{existingReport ? 'Edit' : 'Create'} Report for Study {study?.study_id}</h2>
              <p className="modal-subtitle">{existingReport ? 'Update' : 'Enter'} report details</p>
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

              <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                  <strong>Study Information:</strong><br />
                  Study ID: {study?.study_id}<br />
                  Patient: {patient?.first_name} {patient?.last_name}<br />
                  Modality: {study?.modality}<br />
                  Files: {dicomFiles.length} DICOM file(s)
                </p>
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
                  {existingReport ? 'Save Changes' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudyDetail;
