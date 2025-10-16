import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'
import { ArrowLeft, Save } from 'lucide-react'

const AddReport = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [studyId, setStudyId] = useState('')
  const [studyData, setStudyData] = useState(null)
  const [formData, setFormData] = useState({
    patient_id: '',
    exam_type: '',
    study_date: '',
    appointment_date: '',
    status: 'pending',
    modality: '',
    priority: 'routine',
    assigned_radiologist: '',
    notes: '',
    findings: '',
    impression: '',
    recommendations: ''
  })

  useEffect(() => {
    // Get study_id from URL query parameter
    const params = new URLSearchParams(location.search)
    const studyIdFromUrl = params.get('study_id')
    
    if (studyIdFromUrl) {
      loadStudyData(studyIdFromUrl)
    }
    
    loadPatients()
  }, [location])

  const loadStudyData = async (id) => {
    try {
      const result = await studyService.getStudyById(id)
      if (result.success && result.study) {
        const study = result.study
        setStudyData(study)
        setStudyId(study.study_id || '')
        
        // Pre-fill form with study data
        const studyDate = study.created_at ? new Date(study.created_at).toISOString().slice(0, 16) : ''
        
        setFormData(prev => ({
          ...prev,
          patient_id: study.patient_uuid || '',
          exam_type: study.exam_type || '',
          priority: study.priority || 'routine',
          appointment_date: studyDate,
          notes: study.clinical_history || ''
        }))
      }
    } catch (error) {
      console.error('Error loading study:', error)
    }
  }

  const loadPatients = async () => {
    try {
      const result = await reportService.getAllPatients()
      if (result.success) {
        setPatients(result.patients)
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      window.location.href = '/reports'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const reportData = {
      ...formData,
      study_id: studyId,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    try {
      const result = await reportService.createReport(reportData)
      
      if (result.success) {
        // If this report was created from a study, update the study status
        if (studyData) {
          const statusToSet = reportData.status === 'completed' ? 'completed' : 'reading'
          await studyService.updateStudyStatus(studyData.id, statusToSet)
        }
        
        alert('Report created successfully!')
        navigate('/reports')
      } else {
        alert(`Error creating report: ${result.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container">
      <div className="form-page">
        <div style={{marginBottom: '20px'}}>
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
              textDecoration: 'none', 
              width: 'fit-content'
            }}
          >
            ← Back to Reports
          </Link>
        </div>

        <h1 style={{fontSize: '28px', marginBottom: '24px', color: 'var(--text)'}}>Add New Report</h1>

        <form onSubmit={handleSubmit}>
          {/* Study Information */}
          <div className="form-section">
            <h2 className="form-section-title">Study Information</h2>
            <p className="form-section-subtitle">Basic information about the study</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studyId">Study ID <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">assignment</span>
                  <input 
                    type="text" 
                    id="studyId" 
                    className="form-input" 
                    placeholder="Enter study ID" 
                    value={studyId}
                    onChange={(e) => setStudyId(e.target.value)}
                    readOnly={!!studyData}
                    style={{
                      background: studyData ? 'var(--bg)' : 'var(--panel)',
                      cursor: studyData ? 'not-allowed' : 'text'
                    }}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="patient_id">Patient <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <select 
                    id="patient_id" 
                    className="form-input"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    disabled={!!studyData}
                    style={{
                      background: studyData ? 'var(--bg)' : 'var(--panel)',
                      cursor: studyData ? 'not-allowed' : 'pointer'
                    }}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.patient_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exam_type">Exam Type <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">medical_services</span>
                  <select 
                    id="exam_type"
                    name="exam_type"
                    className="form-input"
                    value={formData.exam_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select exam type</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Mammography">Mammography</option>
                    <option value="Fluoroscopy">Fluoroscopy</option>
                    <option value="Nuclear Medicine">Nuclear Medicine</option>
                    <option value="PET Scan">PET Scan</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="appointment_date">Study/Appointment Date <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">event</span>
                  <input 
                    type="datetime-local" 
                    id="appointment_date"
                    name="appointment_date"
                    className="form-input"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modality">Modality</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">medical_services</span>
                  <select 
                    id="modality"
                    name="modality"
                    className="form-input"
                    value={formData.modality}
                    onChange={handleInputChange}
                  >
                    <option value="">Select modality</option>
                    <option value="CR">CR - Computed Radiography</option>
                    <option value="CT">CT - Computed Tomography</option>
                    <option value="MR">MR - Magnetic Resonance</option>
                    <option value="US">US - Ultrasound</option>
                    <option value="MG">MG - Mammography</option>
                    <option value="XA">XA - X-Ray Angiography</option>
                    <option value="NM">NM - Nuclear Medicine</option>
                    <option value="PT">PT - PET Scan</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">priority_high</span>
                  <select 
                    id="priority"
                    name="priority"
                    className="form-input"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">info</span>
                  <select 
                    id="status"
                    name="status"
                    className="form-input"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="assigned_radiologist">Assigned Radiologist</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input 
                    type="text" 
                    id="assigned_radiologist"
                    name="assigned_radiologist"
                    className="form-input"
                    placeholder="Ex: Dr. Smith"
                    value={formData.assigned_radiologist}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>notes</span>
                  <textarea 
                    id="notes"
                    name="notes"
                    className="form-input"
                    placeholder="Additional notes or instructions for this appointment"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          {/* Report Content */}
          <div className="form-section">
            <h2 className="form-section-title">Report Content</h2>
            <p className="form-section-subtitle">Radiological findings and interpretation</p>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="findings">Findings <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>description</span>
                  <textarea 
                    id="findings"
                    name="findings"
                    className="form-input" 
                    placeholder="Describe the radiological findings..."
                    rows="6"
                    value={formData.findings}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="impression">Impression <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>psychology</span>
                  <textarea 
                    id="impression"
                    name="impression"
                    className="form-input" 
                    placeholder="Provide clinical impression..."
                    rows="4"
                    value={formData.impression}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="recommendations">Recommendations</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>recommend</span>
                  <textarea 
                    id="recommendations"
                    name="recommendations"
                    className="form-input" 
                    placeholder="Any recommendations for follow-up..."
                    rows="3"
                    value={formData.recommendations}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReport
