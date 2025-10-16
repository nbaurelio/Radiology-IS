import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { patientService } from '../services/patientService'
import { ArrowLeft, Calendar, Phone, Mail, User } from 'lucide-react'

const PatientDetail = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatientDetail()
  }, [id])

  const loadPatientDetail = async () => {
    try {
      const result = await patientService.getPatientDetail(id)
      if (result.success) {
        setPatient(result.patient)
        setAppointments(result.appointments)
      } else {
        console.error('Error loading patient:', result.message)
      }
    } catch (error) {
      console.error('Error loading patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditInfo = () => {
    alert('Edit functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)'}}>Loading patient details...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container">
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink)'}}>
            Patient Not Found
          </h2>
          <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/patients" className="btn-create">
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown'

  return (
    <div className="container">
      <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
          onClick={handleEditInfo}
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
          <span className="material-icons" style={{fontSize: '21px', color: 'var(--muted)'}}>edit</span>
          Edit Info
        </button>
      </div>

      <section className="grid">
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Patient Information</div>
          <div className="bd">
            <div style={{padding: '20px'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
                {/* Personal Information */}
                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Personal Information
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div>
                      <strong>Patient ID:</strong> {patient.patient_id}
                    </div>
                    <div>
                      <strong>Full Name:</strong> {fullName}
                    </div>
                    <div>
                      <strong>Date of Birth:</strong> {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <strong>Sex:</strong> {patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}
                    </div>
                    {patient.mrn && (
                      <div>
                        <strong>MRN:</strong> {patient.mrn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Contact Information
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div>
                      <strong>Phone:</strong> {patient.phone || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {patient.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Address:</strong> {patient.address || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)'}}>
                    Medical Information
                  </h3>
                  <div>
                    <strong>Medical History:</strong>
                    <p style={{marginTop: '4px', color: 'var(--muted)'}}>
                      {patient.medical_history || 'No medical history recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Appointments Section */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Appointments</div>
          <div className="bd">
            <div>
              <p style={{textAlign: 'center', color: 'var(--muted)', padding: '20px'}}>
                No appointments scheduled.
              </p>
            </div>
          </div>
        </article>

        {/* Studies History */}
        <article className="card" style={{gridColumn: '1 / -1'}}>
          <div className="hd">Studies History</div>
          <div className="bd">
            <div>
              <p style={{textAlign: 'center', color: 'var(--muted)', padding: '20px'}}>
                No studies found for this patient.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default PatientDetail
