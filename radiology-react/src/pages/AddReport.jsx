import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { studyService } from '../services/studyService'
import { ArrowLeft, Save } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const AddReport = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [studyData, setStudyData] = useState(null)
  const [formData, setFormData] = useState({
    study_id: '',
    patient_id: '',
    exam_type: '',
    modality: '',
    priority: 'routine',
    status: 'pending',
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
  }, [location])

  const loadStudyData = async (id) => {
    try {
      const result = await studyService.getStudyById(id)
      if (result.success && result.study) {
        const study = result.study
        setStudyData(study)
        
        // Pre-fill form with study data
        setFormData(prev => ({
          ...prev,
          study_id: study.study_id || '',
          patient_id: study.patient_uuid || '',
          exam_type: study.exam_type || '',
          modality: study.modality || '',
          priority: study.priority || 'routine',
          notes: study.clinical_history || ''
        }))
      }
    } catch (error) {
      console.error('Error loading study:', error)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      if (studyData) {
        navigate(`/studies/${studyData.id}`)
      } else {
        navigate('/reports')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const reportData = {
      ...formData,
      appointment_date: new Date().toISOString(),
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
        
        addNotification(createNotification({
          type: 'report_created',
          title: '✅ Report Created',
          message: `Report created for study ${formData.study_id || 'N/A'}. Status: ${reportData.status}.`,
          priority: PRIORITY_LEVELS.ROUTINE,
          recipientRole: USER_ROLES.RADIOLOGIST,
          linkedEntity: { study_id: formData.study_id },
          actionLink: `/reports`,
          autoRemove: false
        }))
        navigate('/reports')
      } else {
        addNotification(createNotification({
          type: 'report_creation_failed',
          title: '❌ Report Creation Failed',
          message: `Error creating report: ${result.message}`,
          priority: PRIORITY_LEVELS.URGENT,
          recipientRole: USER_ROLES.RADIOLOGIST,
          autoRemove: false
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      addNotification(createNotification({
        type: 'report_creation_failed',
        title: '❌ Error',
        message: 'An unexpected error occurred while creating the report. Please try again.',
        priority: PRIORITY_LEVELS.URGENT,
        recipientRole: USER_ROLES.RADIOLOGIST,
        autoRemove: false
      }))
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
            to={studyData ? `/studies/${studyData.id}` : '/reports'}
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
            ← Back to {studyData ? 'Study' : 'Reports'}
          </Link>
        </div>

        <h1 style={{fontSize: '28px', marginBottom: '24px', color: 'var(--text)'}}>Add New Report</h1>

        <form onSubmit={handleSubmit}>
          {/* Study Information - READ ONLY */}
          <div className="form-section">
            <h2 className="form-section-title">Study Information</h2>
            <p className="form-section-subtitle">Pre-filled from the study</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="study_id">Study ID</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">assignment</span>
                  <input 
                    type="text" 
                    id="study_id" 
                    className="form-input" 
                    value={formData.study_id}
                    readOnly
                    style={{
                      background: 'var(--bg)',
                      cursor: 'not-allowed',
                      paddingLeft: '40px'
                    }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="patient_name">Patient</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input 
                    type="text" 
                    id="patient_name" 
                    className="form-input"
                    value={studyData?.patients ? `${studyData.patients.first_name} ${studyData.patients.last_name}` : 'N/A'}
                    readOnly
                    style={{
                      background: 'var(--bg)',
                      cursor: 'not-allowed',
                      paddingLeft: '40px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exam_type">Exam Type</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">medical_services</span>
                  <input 
                    type="text" 
                    id="exam_type" 
                    className="form-input"
                    value={formData.exam_type || 'N/A'}
                    readOnly
                    style={{
                      background: 'var(--bg)',
                      cursor: 'not-allowed',
                      paddingLeft: '40px'
                    }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="modality">Modality</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">medical_services</span>
                  <input 
                    type="text" 
                    id="modality" 
                    className="form-input"
                    value={formData.modality || 'N/A'}
                    readOnly
                    style={{
                      background: 'var(--bg)',
                      cursor: 'not-allowed',
                      paddingLeft: '40px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">priority_high</span>
                  <select 
                    id="priority"
                    name="priority"
                    className="form-input"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
              </div>
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
                    style={{paddingLeft: '40px'}}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
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
                    style={{paddingLeft: '40px'}}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="notes">Clinical History / Notes</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>notes</span>
                  <textarea 
                    id="notes"
                    name="notes"
                    className="form-input"
                    placeholder="Clinical history from the study"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content - EDITABLE */}
          <div className="form-section">
            <h2 className="form-section-title">Report Content</h2>
            <p className="form-section-subtitle">Enter your radiological findings and interpretation</p>

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
                    style={{paddingLeft: '40px'}}
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
                    style={{paddingLeft: '40px'}}
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
                    style={{paddingLeft: '40px'}}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{alignItems: 'center'}}>
            <button type="button" className="btn-cancel" onClick={handleCancel} style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading} style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {loading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReport