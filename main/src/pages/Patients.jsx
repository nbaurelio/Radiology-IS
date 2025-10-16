import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/patients.css';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    sex: 'male',
    phone: '',
    email: '',
    address: '',
    medical_history: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    // Simulate loading data - replace with actual API calls
    setTimeout(() => {
      const mockPatients = [
        { id: 1, patient_id: 'PT-001', first_name: 'John', last_name: 'Doe', sex: 'male', next_appointment: '2024-10-20T10:00:00', phone: '555-0101', email: 'john.doe@email.com' },
        { id: 2, patient_id: 'PT-002', first_name: 'Jane', last_name: 'Smith', sex: 'female', next_appointment: null, phone: '555-0102', email: 'jane.smith@email.com' },
        { id: 3, patient_id: 'PT-003', first_name: 'Bob', last_name: 'Johnson', sex: 'male', next_appointment: '2024-10-18T14:30:00', phone: '555-0103', email: 'bob.j@email.com' },
      ];
      setPatients(mockPatients);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement search logic here
  };

  const handleAddPatient = () => {
    setShowModal(true);
    setFormData({
      patient_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      sex: 'male',
      phone: '',
      email: '',
      address: '',
      medical_history: ''
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
    // Simulate adding patient - replace with actual API call
    const newPatient = {
      id: patients.length + 1,
      ...formData,
      next_appointment: null
    };
    setPatients([...patients, newPatient]);
    alert(`✅ Patient added successfully!\n\nPatient ID: ${formData.patient_id}\nName: ${formData.first_name} ${formData.last_name}`);
    handleCloseModal();
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const formatAppointment = (appointmentDate) => {
    if (!appointmentDate) {
      return <span className="badge badge-no-appointment">No Appointment</span>;
    }
    const date = new Date(appointmentDate);
    const dateStr = date.toLocaleDateString('en-CA');
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${dateStr} ${hours}:${minutes} ${ampm}`;
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || patient.patient_id.toLowerCase().includes(search);
  });

  return (
    <>
      <Header activePage="patients" />
      
      <main className="container">
        <section className="grid">
          {/* Search and Add Patient Bar */}
          <article className="card search-bar">
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                id="searchInput" 
                placeholder="Search patients by name, ID, or exam type..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button className="add-patient-btn" onClick={handleAddPatient} aria-label="Add Patient">
              <span className="plus-icon">+</span>
            </button>
          </article>

          {/* Patients List */}
          <article className="card table-card">
            <div className="hd">Patient Records (<span id="patientCount">{filteredPatients.length}</span>)</div>
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
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading patients...</td>
                      </tr>
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                          No patients found. Click + to add a new patient.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map(patient => {
                        const fullName = `${patient.first_name} ${patient.last_name}`;
                        const contactDisplay = patient.phone && patient.email 
                          ? <>{patient.phone}<br /><small style={{ color: 'var(--muted)' }}>{patient.email}</small></>
                          : patient.phone || patient.email || 'N/A';
                        
                        return (
                          <tr key={patient.id} onClick={() => handlePatientClick(patient.id)}>
                            <td data-label="Patient ID">{patient.patient_id}</td>
                            <td data-label="Name">{fullName}</td>
                            <td data-label="Sex">{patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}</td>
                            <td data-label="Next Appointment">{formatAppointment(patient.next_appointment)}</td>
                            <td data-label="Contact">{contactDisplay}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </section>
      </main>

      {/* Add Patient Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && handleCloseModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2>Add New Patient</h2>
              <p className="modal-subtitle">Enter patient information</p>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient_id">Patient ID <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🆔</span>
                    <input 
                      type="text" 
                      id="patient_id" 
                      name="patient_id"
                      className="form-input" 
                      placeholder="Ex: PT-001" 
                      required
                      value={formData.patient_id}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="sex">Sex <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">⚧</span>
                    <select 
                      id="sex" 
                      name="sex"
                      className="form-input" 
                      required
                      value={formData.sex}
                      onChange={handleInputChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input 
                      type="text" 
                      id="first_name" 
                      name="first_name"
                      className="form-input" 
                      placeholder="First name" 
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input 
                      type="text" 
                      id="last_name" 
                      name="last_name"
                      className="form-input" 
                      placeholder="Last name" 
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📅</span>
                    <input 
                      type="date" 
                      id="date_of_birth" 
                      name="date_of_birth"
                      className="form-input"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📞</span>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      className="form-input" 
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📧</span>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      className="form-input" 
                      placeholder="patient@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🏠</span>
                    <input 
                      type="text" 
                      id="address" 
                      name="address"
                      className="form-input" 
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="medical_history">Medical History</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📋</span>
                    <textarea 
                      id="medical_history" 
                      name="medical_history"
                      className="form-input" 
                      placeholder="Brief medical history..."
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={formData.medical_history}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-create" style={{ marginTop: '20px' }}>
                Add Patient
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Patients;
