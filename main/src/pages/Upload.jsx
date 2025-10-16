import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/upload.css';

function Upload() {
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [priority, setPriority] = useState('routine');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStudies();
    loadPatients();
  }, []);

  const loadStudies = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockStudies = [
        {
          id: 1,
          study_id: 'STD-2024-001',
          patient_name: 'John Doe',
          modality: 'CT',
          file_count: 5,
          study_date: '2024-10-15',
          priority: 'urgent',
          status: 'pending'
        },
        {
          id: 2,
          study_id: 'STD-2024-002',
          patient_name: 'Jane Smith',
          modality: 'MRI',
          file_count: 8,
          study_date: '2024-10-16',
          priority: 'stat',
          status: 'reading'
        },
        {
          id: 3,
          study_id: 'STD-2024-003',
          patient_name: 'Bob Johnson',
          modality: 'X-Ray',
          file_count: 3,
          study_date: '2024-10-16',
          priority: 'routine',
          status: 'completed'
        },
      ];
      setStudies(mockStudies);
      setLoading(false);
    }, 500);
  };

  const loadPatients = () => {
    const mockPatients = [
      { id: 1, patient_id: 'PT-001', first_name: 'John', last_name: 'Doe' },
      { id: 2, patient_id: 'PT-002', first_name: 'Jane', last_name: 'Smith' },
      { id: 3, patient_id: 'PT-003', first_name: 'Bob', last_name: 'Johnson' },
    ];
    setPatients(mockPatients);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUpload = () => {
    setShowModal(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setSelectedPatient('');
    setClinicalHistory('');
    setPriority('routine');
    setUploadProgress(0);
    setUploadStatus('');
    setUploading(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    const validExtensions = ['.dcm', '.dicom', '.zip'];

    for (let file of files) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 2GB limit and will be skipped.`);
        continue;
      }

      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        alert(`File "${file.name}" has invalid extension. Only .dcm, .dicom, and .zip files are supported.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const simulateProgress = (start, end, duration) => {
    return new Promise(resolve => {
      const steps = 20;
      const increment = (end - start) / steps;
      const stepDuration = duration / steps;
      let current = start;

      const interval = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(Math.round(current));
      }, stepDuration);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one DICOM file to upload');
      return;
    }

    setUploading(true);

    try {
      setUploadStatus('Validating files...');
      await simulateProgress(0, 20, 500);

      setUploadStatus('Generating Study ID...');
      await simulateProgress(20, 40, 300);
      const studyId = `STD-2024-${String(studies.length + 1).padStart(3, '0')}`;

      setUploadStatus('Extracting DICOM metadata...');
      await simulateProgress(40, 60, 500);

      setUploadStatus('Creating study record...');
      await simulateProgress(60, 80, 500);

      setUploadStatus('Saving to database...');
      await simulateProgress(80, 100, 500);

      const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
      
      alert(`✅ Upload successful!\n\nStudy ID: ${studyId}\nFiles: ${selectedFiles.length}\nTotal size: ${totalSize.toFixed(2)} MB\n\nThe study is now in the pending worklist.`);

      handleCloseModal();
      loadStudies();
    } catch (error) {
      console.error('Error uploading study:', error);
      alert('❌ Error: An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStudyClick = (studyId) => {
    navigate(`/upload/${studyId}`);
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

  const filteredStudies = studies.filter(study => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      study.study_id.toLowerCase().includes(search) ||
      study.patient_name.toLowerCase().includes(search) ||
      study.modality.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Header activePage="upload" />
      
      <main className="container">
        <section className="grid">
          {/* Search and Add Upload Bar */}
          <article className="card search-bar">
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search studies by patient, study ID, or modality..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: '12px', 
                  background: 'var(--panel)', 
                  color: 'var(--ink)', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => navigate('/reports')}
                aria-label="Create Report"
              >
                📝 Create Report
              </button>
              <button className="add-patient-btn" onClick={handleAddUpload} aria-label="Upload DICOM">
                <span className="plus-icon">+</span>
              </button>
            </div>
          </article>

          {/* Studies List */}
          <article className="card table-card">
            <div className="hd">DICOM Studies (<span>{filteredStudies.length}</span>)</div>
            <div className="bd">
              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Study ID</th>
                      <th>Patient</th>
                      <th>Modality</th>
                      <th>Study Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                          Loading studies...
                        </td>
                      </tr>
                    ) : filteredStudies.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                          No studies found. Click + to upload a new DICOM study.
                        </td>
                      </tr>
                    ) : (
                      filteredStudies.map(study => (
                        <tr key={study.id} onClick={() => handleStudyClick(study.study_id)}>
                          <td data-label="Study ID">{study.study_id}</td>
                          <td data-label="Patient">{study.patient_name}</td>
                          <td data-label="Modality">{study.modality} ({study.file_count} files)</td>
                          <td data-label="Study Date">{new Date(study.study_date).toLocaleDateString()}</td>
                          <td data-label="Priority">
                            <span className={`badge ${getPriorityBadgeClass(study.priority)}`}>
                              {study.priority === 'stat' ? 'STAT' : study.priority.charAt(0).toUpperCase() + study.priority.slice(1)}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${getStatusBadgeClass(study.status)}`}>
                              {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                            </span>
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

      {/* Upload DICOM Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && handleCloseModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2>Upload DICOM Study</h2>
              <p className="modal-subtitle">Upload DICOM files (.dcm, .dicom) or compressed archives (.zip)</p>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Patient Selection */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="patientSelect">Select Patient <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <select 
                      id="patientSelect" 
                      className="form-input" 
                      required
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                    >
                      <option value="">Select a patient</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.patient_id} - {p.first_name} {p.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small style={{ color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Patient ID is required for study association
                  </small>
                </div>
              </div>

              {/* Drag and Drop Upload Area */}
              <div 
                className="upload-zone" 
                onClick={handleBrowseClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  accept=".dcm,.dicom,.zip" 
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div className="upload-zone-content">
                  <div className="upload-icon">☁️</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--ink)' }}>Drag & Drop DICOM Files</h3>
                  <p style={{ margin: '0 0 16px 0', color: 'var(--muted)' }}>or click to browse</p>
                  <button type="button" className="btn" style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                    Browse Files
                  </button>
                  <p style={{ margin: '16px 0 0 0', fontSize: '12px', color: 'var(--muted)' }}>Supported: .dcm, .dicom, .zip (Max 2GB per file)</p>
                </div>
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                    Selected Files (<span>{selectedFiles.length}</span>)
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px' }}>
                    {selectedFiles.map((file, index) => {
                      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                      return (
                        <div key={index} className="file-item">
                          <div className="file-item-info">
                            <span style={{ fontSize: '20px' }}>{file.name.endsWith('.zip') ? '📦' : '📄'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="file-item-name">{file.name}</div>
                              <div className="file-item-size">{sizeInMB} MB</div>
                            </div>
                          </div>
                          <div className="file-item-status">
                            <span className="badge badge-pending">Ready</span>
                            <button 
                              type="button" 
                              className="file-remove-btn" 
                              onClick={() => removeFile(index)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Study Metadata */}
              <div className="form-row" style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label htmlFor="clinicalHistory">Clinical History</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📝</span>
                    <input 
                      type="text" 
                      id="clinicalHistory" 
                      className="form-input" 
                      placeholder="Ex: Suspected pneumonia"
                      value={clinicalHistory}
                      onChange={(e) => setClinicalHistory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="examPriority">Exam Priority <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">⚠️</span>
                    <select 
                      id="examPriority" 
                      className="form-input" 
                      required
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>Uploading...</span>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand), #7a5af8)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--muted)' }}>{uploadStatus}</p>
                </div>
              )}

              <button type="submit" className="btn-create" disabled={uploading} style={{ marginTop: '20px' }}>
                {uploading ? 'Uploading...' : 'Upload Study'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Upload;
