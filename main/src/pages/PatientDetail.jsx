import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/patients.css';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!id) {
      navigate('/patients');
      return;
    }
    loadPatientDetails();
  }, [id, navigate]);

  const loadPatientDetails = async () => {
    setLoading(true);
    // Simulate loading - replace with actual API call
    setTimeout(() => {
      const mockPatient = {
        id: id,
        patient_id: 'PT-001',
        mrn: 'MRN-12345',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1985-05-15',
        sex: 'male',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com',
        address: '123 Main St, City, State 12345',
        medical_history: 'Hypertension, Type 2 Diabetes',
        registration_date: '2020-01-15',
        last_visit_date: '2024-10-10'
      };

      const mockAppointments = [
        {
          id: 1,
          type: 'study',
          study_id: 'STD-2024-001',
          created_at: '2024-10-15T09:30:00',
          status: 'completed',
          clinical_history: 'Chest pain, rule out pneumonia',
          dicom_files: [{ name: 'file1.dcm' }, { name: 'file2.dcm' }]
        },
        {
          id: 2,
          type: 'report',
          study_id: 'STD-2024-002',
          exam_type: 'Brain MRI',
          schedule: '2024-10-16T14:00:00',
          status: 'pending',
          notes: 'Follow-up scan'
        }
      ];

      const mockStudies = [
        {
          id: 1,
          study_id: 'STD-2024-100',
          exam_type: 'Chest X-Ray',
          study_date: '2024-09-20',
          modality: 'X-Ray',
          status: 'completed'
        }
      ];

      setPatient(mockPatient);
      setFormData(mockPatient);
      setAppointments(mockAppointments);
      setStudies(mockStudies);
      setLoading(false);
    }, 500);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(patient);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Simulate save - replace with actual API call
    alert('Patient information updated successfully!');
    setPatient(formData);
    setIsEditMode(false);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'scheduled' || status === 'pending') return 'badge-pending';
    if (status === 'completed') return 'badge-done';
    return 'badge-reading';
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
        <Header activePage="patients" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading patient details...</p>
        </main>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Header activePage="patients" />
        <main className="container">
          <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>Patient not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activePage="patients" />
      
      <main className="container">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link 
            to="/patients" 
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
            ← Back to Patients
          </Link>
          <button 
            onClick={handleEditClick}
            disabled={isEditMode}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              border: '1px solid var(--card-border)', 
              borderRadius: 'var(--radius)', 
              background: 'var(--panel)', 
              color: 'var(--ink)', 
              cursor: isEditMode ? 'not-allowed' : 'pointer', 
              transition: 'border-color 0.2s ease', 
              fontFamily: 'inherit', 
              fontSize: '14px',
              opacity: isEditMode ? 0.6 : 1
            }}
          >
            ✏️ {isEditMode ? 'Editing...' : 'Edit Info'}
          </button>
        </div>

        <section className="grid">
          {/* Patient Information */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Patient Information</div>
            <div className="bd">
              <div style={{ padding: '20px' }}>
                {isEditMode ? (
                  <form onSubmit={handleSaveChanges}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600, width: '30%' }}>Patient ID</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="text" 
                              name="patient_id" 
                              value={formData.patient_id || ''} 
                              onChange={handleInputChange}
                              required
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Medical Record Number (MRN)</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="text" 
                              name="mrn" 
                              value={formData.mrn || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>First Name</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="text" 
                              name="first_name" 
                              value={formData.first_name || ''} 
                              onChange={handleInputChange}
                              required
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Last Name</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="text" 
                              name="last_name" 
                              value={formData.last_name || ''} 
                              onChange={handleInputChange}
                              required
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Date of Birth</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="date" 
                              name="date_of_birth" 
                              value={formData.date_of_birth || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Sex</td>
                          <td style={{ padding: '12px' }}>
                            <select 
                              name="sex" 
                              value={formData.sex || 'male'} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Phone</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="tel" 
                              name="phone" 
                              value={formData.phone || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Email</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="email" 
                              name="email" 
                              value={formData.email || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Address</td>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="text" 
                              name="address" 
                              value={formData.address || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Medical History Summary</td>
                          <td style={{ padding: '12px' }}>
                            <textarea 
                              name="medical_history" 
                              value={formData.medical_history || ''} 
                              onChange={handleInputChange}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: 'var(--panel)', color: 'var(--ink)', minHeight: '80px' }}
                            />
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Registration Date</td>
                          <td style={{ padding: '12px' }}>{patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', fontWeight: 600 }}>Last Visit / Last Study</td>
                          <td style={{ padding: '12px' }}>{patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'No visits recorded'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        className="btn" 
                        style={{ border: '1px solid var(--card-border)', padding: '8px 16px', borderRadius: '8px', background: 'var(--panel)', color: 'var(--ink)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn" 
                        style={{ background: 'linear-gradient(135deg, var(--brand), #7a5af8)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, width: '30%' }}>Patient ID</td>
                        <td style={{ padding: '12px' }}>{patient.patient_id || 'N/A'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Medical Record Number (MRN)</td>
                        <td style={{ padding: '12px' }}>{patient.mrn || 'N/A'}</td>
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
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Contact Information</td>
                        <td style={{ padding: '12px' }}>
                          {patient.phone && `Phone: ${patient.phone}`}<br />
                          {patient.email && `Email: ${patient.email}`}
                          {!patient.phone && !patient.email && 'N/A'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Address</td>
                        <td style={{ padding: '12px' }}>{patient.address || 'N/A'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Medical History Summary</td>
                        <td style={{ padding: '12px' }}>{patient.medical_history || 'No medical history recorded'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Registration Date</td>
                        <td style={{ padding: '12px' }}>{patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontWeight: 600 }}>Last Visit / Last Study</td>
                        <td style={{ padding: '12px' }}>{patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'No visits recorded'}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </article>

          {/* Appointments Section */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Appointments</div>
            <div className="bd">
              {appointments.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No studies or reports found</p>
              ) : (
                appointments.map(apt => {
                  const dateStr = formatDateTime(apt.created_at || apt.study_date || apt.schedule);
                  const statusClass = getStatusBadgeClass(apt.status || 'pending');
                  const isStudy = apt.type === 'study';
                  const typeLabel = isStudy ? 'DICOM Study' : 'Report';
                  const title = isStudy ? 'DICOM Study Upload' : (apt.exam_type || 'Radiology Report');
                  const description = isStudy ? 
                    (apt.clinical_history || 'No clinical history provided') : 
                    (apt.notes || 'No notes provided');
                  const fileInfo = isStudy && apt.dicom_files ? `${apt.dicom_files.length} DICOM file(s)` : '';

                  return (
                    <div 
                      key={apt.id}
                      style={{ padding: '16px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                      onClick={() => navigate(isStudy ? `/upload/${apt.id}` : `/reports/${apt.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px' }}>{typeLabel}</span>
                            <strong>{title}</strong>
                          </div>
                          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{dateStr}</span><br />
                          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Study ID: {apt.study_id}</span><br />
                          {fileInfo && <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{fileInfo}</span>}
                          {fileInfo && <br />}
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--muted)' }}>{description}</p>
                        </div>
                        <span className={`badge ${statusClass}`}>{(apt.status || 'pending').toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          {/* Studies History */}
          <article className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="hd">Studies History</div>
            <div className="bd">
              {studies.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No studies found</p>
              ) : (
                studies.map(study => {
                  const date = study.study_date ? new Date(study.study_date).toLocaleDateString() : 'N/A';
                  const statusClass = getStatusBadgeClass(study.status || 'pending');

                  return (
                    <div key={study.id} style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{study.study_id}</strong> - {study.exam_type || 'N/A'}<br />
                          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
                            Date: {date} | Modality: {study.modality || 'N/A'}
                          </span>
                        </div>
                        <span className={`badge ${statusClass}`}>{(study.status || 'pending').toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

export default PatientDetail;
