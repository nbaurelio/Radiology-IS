import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { generateReportPDF } from '../utils/pdfGenerator'

const GenerateReport = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  // Form data for missing fields
  const [formData, setFormData] = useState({
    technologistName: '',
    doctorCredentials: 'MD FRCR FUSP',
    clinicName: 'XferDx',
    clinicAddress: 'Second Floor, SM City Santa Rosa Expansion,\nBrgy. Tagapo, Old National Highway, Sta. Rosa,\nLaguna Tel No: (02) 8396-9898 local 6251 to 6257',
    clinicMobile: '(0953) 827 6259',
    clinicEmail: 'sampleemailclient@gmail.com'
  })

  useEffect(() => {
    loadReport()
  }, [id])

  const loadReport = async () => {
    try {
      const result = await reportService.getReportById(id)
      if (result.success) {
        setReport(result.report)
      } else {
        alert('Report not found')
        navigate('/reports')
      }
    } catch (error) {
      console.error('Error loading report:', error)
      alert('Failed to load report')
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

  const handleGeneratePDF = async (e) => {
    e.preventDefault()
    setGenerating(true)
    
    try {
      await generateReportPDF(report, formData)
      alert('PDF generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)'}}>Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
            Report Not Found
          </h2>
          <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
            The report you're trying to generate doesn't exist.
          </p>
          <Link to="/reports" className="btn-create">
            Back to Reports
          </Link>
        </div>
      </div>
    )
  }

  const patientName = report.patients ? 
    `${report.patients.first_name} ${report.patients.last_name}` : 
    report.name || 'Unknown Patient'

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="container">
      <div className="form-page">
        <div style={{marginBottom: '20px'}}>
          <Link 
            to={`/reports/${id}`}
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
            ← Back to Report
          </Link>
        </div>

        <h1 style={{fontSize: '28px', marginBottom: '24px', color: 'var(--text)'}}>Generate PDF Report</h1>

        <form onSubmit={handleGeneratePDF}>
          {/* Report Information (Read-only) */}
          <div className="form-section">
            <h2 className="form-section-title">Report Information</h2>
            <p className="form-section-subtitle">Information from the existing report</p>

            <div className="form-row">
              <div className="form-group">
                <label>Study ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={report.study_id || 'N/A'}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
              <div className="form-group">
                <label>Exam Type</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={report.exam_type || 'N/A'}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Patient Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={patientName}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={report.patients?.date_of_birth ? `${calculateAge(report.patients.date_of_birth)}Y${report.patients.sex ? `, ${report.patients.sex.charAt(0).toUpperCase()}` : ''}` : 'N/A'}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assigned Radiologist</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={report.assigned_radiologist || 'N/A'}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
              <div className="form-group">
                <label>Study Date</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={report.study_date ? new Date(report.study_date).toLocaleDateString() : 'N/A'}
                  readOnly
                  style={{background: 'var(--bg)', cursor: 'not-allowed'}}
                />
              </div>
            </div>
          </div>

          {/* Additional Information (Editable) */}
          <div className="form-section">
            <h2 className="form-section-title">Additional Information</h2>
            <p className="form-section-subtitle">Required information for PDF generation</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="technologistName">Radiologic Technologist Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">person</span>
                  <input 
                    type="text" 
                    id="technologistName"
                    name="technologistName"
                    className="form-input" 
                    placeholder="Ex: Michelle Ann L. Madrigal, RRT"
                    value={formData.technologistName}
                    onChange={handleInputChange}
                    required
                    style={{paddingLeft: '40px'}}
                  />
                </div>
                <small style={{color: 'var(--muted)', marginTop: '4px', display: 'block'}}>
                  Include credentials (e.g., RRT)
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="doctorCredentials">Doctor Credentials <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">school</span>
                  <input 
                    type="text" 
                    id="doctorCredentials"
                    name="doctorCredentials"
                    className="form-input" 
                    placeholder="Ex: MD FRCR FUSP"
                    value={formData.doctorCredentials}
                    onChange={handleInputChange}
                    required
                    style={{paddingLeft: '40px'}}
                  />
                </div>
                <small style={{color: 'var(--muted)', marginTop: '4px', display: 'block'}}>
                  Medical degrees and certifications
                </small>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="form-section">
            <h2 className="form-section-title">Clinic Information</h2>
            <p className="form-section-subtitle">Information that will appear in the PDF header</p>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="clinicName">Clinic Name</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">business</span>
                  <input 
                    type="text" 
                    id="clinicName"
                    name="clinicName"
                    className="form-input" 
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="clinicAddress">Clinic Address</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon" style={{top: '12px'}}>location_on</span>
                  <textarea 
                    id="clinicAddress"
                    name="clinicAddress"
                    className="form-input" 
                    rows="3"
                    value={formData.clinicAddress}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clinicMobile">Mobile Number</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">phone</span>
                  <input 
                    type="text" 
                    id="clinicMobile"
                    name="clinicMobile"
                    className="form-input" 
                    value={formData.clinicMobile}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="clinicEmail">Email Address</label>
                <div className="input-with-icon">
                  <span className="material-icons input-icon">email</span>
                  <input 
                    type="email" 
                    id="clinicEmail"
                    name="clinicEmail"
                    className="form-input" 
                    value={formData.clinicEmail}
                    onChange={handleInputChange}
                    style={{paddingLeft: '40px'}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{alignItems: 'center'}}>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate(`/reports/${id}`)}
              style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-create" 
              disabled={generating}
              style={{height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            >
              <span className="material-symbols-outlined" style={{fontSize: '21px'}}>picture_as_pdf</span>
              {generating ? 'Generating PDF...' : 'Generate PDF Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GenerateReport
