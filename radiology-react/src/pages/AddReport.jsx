import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { ArrowLeft, Save } from 'lucide-react'

const AddReport = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [studyId, setStudyId] = useState('')
  const [formData, setFormData] = useState({
    patient_id: '',
    exam_type: '',
    study_date: '',
    appointment_date: '',
    status: 'pending',
    modality: '',
    priority: 'routine',
    assigned_radiologist: '',
    notes: ''
  })

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      window.location.href = '/reports'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = {
      study_id: document.getElementById('studyId').value.trim(),
      patient_name: document.getElementById('patientName').value.trim(),
      exam_type: document.getElementById('examType').value.trim(),
      study_date: document.getElementById('studyDate').value,
      priority: document.getElementById('priority').value,
      findings: document.getElementById('findings').value.trim(),
      impression: document.getElementById('impression').value.trim(),
      recommendations: document.getElementById('recommendations').value.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    try {
      const result = await reportService.createReport(formData)
      
      if (result.success) {
        alert('Report created successfully!')
        window.location.href = '/reports'
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
                  <input type="text" id="studyId" className="form-input" placeholder="Enter study ID" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="patientName">Patient Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input type="text" id="patientName" className="form-input" placeholder="Enter patient name" required />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="examType">Exam Type <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">medical_services</span>
                  <input type="text" id="examType" className="form-input" placeholder="e.g., Chest X-Ray, CT Scan" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="studyDate">Study Date <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">event</span>
                  <input type="date" id="studyDate" className="form-input" required />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">priority_high</span>
                  <select id="priority" className="form-input" required>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
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
                    className="form-input" 
                    placeholder="Describe the radiological findings..."
                    rows="6"
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
                    className="form-input" 
                    placeholder="Provide clinical impression..."
                    rows="4"
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
                    className="form-input" 
                    placeholder="Any recommendations for follow-up..."
                    rows="3"
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
