import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientService } from '../services/patientService'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPatients(searchTerm.trim())
      } else {
        loadPatients()
      }
    }, 300)

    setSearchTimeout(timeout)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  const loadPatients = async () => {
    try {
      const result = await patientService.getAllPatients()
      if (result.success) {
        setPatients(result.patients)
      } else {
        console.error('Error loading patients:', result.message)
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async (term) => {
    try {
      const result = await patientService.searchPatients(term)
      if (result.success) {
        setPatients(result.patients)
      }
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const formatAppointment = (appointment) => {
    if (!appointment) {
      return <span className="badge badge-no-appointment">No Appointment</span>
    }

    const date = new Date(appointment)
    const dateStr = date.toLocaleDateString('en-CA')
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12

    return `${dateStr} ${hours}:${minutes} ${ampm}`
  }

  const formatContact = (patient) => {
    if (patient.phone && patient.email) {
      return `${patient.phone}<br><small style="color: var(--muted);">${patient.email}</small>`
    } else if (patient.phone) {
      return patient.phone
    } else if (patient.email) {
      return patient.email
    }
    return 'N/A'
  }

  return (
    <section className="grid">
      {/* Search and Add Patient Bar */}
      <article className="card search-bar">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name, ID, or exam type..." 
          />
        </div>
        <Link to="/patients/add" className="add-patient-btn" aria-label="Add Patient">
          <span className="plus-icon">+</span>
        </Link>
      </article>

      {/* Patients List */}
      <article className="card table-card">
        <div className="hd">Patient Records (<span>{patients.length}</span>)</div>
        <div className="bd">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Next Appointment</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '24px'}}>Loading patients...</td>
                  </tr>
                ) : patients.length > 0 ? (
                  patients.map((patient) => {
                    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.name || 'Unknown'
                    
                    return (
                      <tr 
                        key={patient.id}
                        onClick={() => window.location.href = `/patients/${patient.id}`}
                        style={{cursor: 'pointer'}}
                      >
                        <td data-label="Patient ID">{patient.patient_id || 'N/A'}</td>
                        <td data-label="Name">{fullName}</td>
                        <td data-label="Sex">{patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}</td>
                        <td data-label="Next Appointment">{formatAppointment(patient.next_appointment)}</td>
                        <td data-label="Contact" dangerouslySetInnerHTML={{__html: formatContact(patient)}}></td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '24px'}}>
                      {searchTerm 
                        ? 'No patients found matching your search.'
                        : 'No patients found. Click + to add a new patient.'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  )
}

export default Patients
