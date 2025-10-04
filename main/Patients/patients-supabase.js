// COMPLETE patients-supabase.js - Copy this entire file!

const modal = document.getElementById('addPatientModal');
const addBtn = document.getElementById('addPatientBtn');
const closeBtn = document.getElementById('closeModalBtn');
const form = document.getElementById('patientForm');
const tableBody = document.getElementById('patientsTableBody');
const patientCount = document.getElementById('patientCount');
const searchInput = document.getElementById('searchInput');

let allPatients = [];
let searchTimeout;

// Check authentication and load patients
(async function() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '../Login/login.html';
        return;
    }
    
    // Load patients when page loads
    loadPatients();
})();

// Load all patients from database
async function loadPatients() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allPatients = data || [];
        displayPatients(allPatients);
        updatePatientCount(allPatients.length);
        
    } catch (error) {
        console.error('Error loading patients:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:var(--muted);">
                    <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
                    Error loading patients: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display patients in table
function displayPatients(patients) {
    if (patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:var(--muted);">
                    <div style="font-size:48px; margin-bottom:16px;">👥</div>
                    No patients found. Click the + button to add one!
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = patients.map(patient => {
        const createdDate = new Date(patient.created_at).toLocaleDateString();
        const sexBadge = getSexBadge(patient.sex);
        
        return `
            <tr data-patient-id="${patient.id}">
                <td data-label="Patient ID"><strong>${patient.patient_id}</strong></td>
                <td data-label="Name">${patient.name}</td>
                <td data-label="Sex">${sexBadge}</td>
                <td data-label="Created">${createdDate}</td>
                <td data-label="Actions">
                    <button class="btn-view" onclick="viewPatient('${patient.id}')">View</button>
                    <button class="btn-delete" onclick="deletePatient('${patient.id}', '${patient.patient_id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get styled badge for sex
function getSexBadge(sex) {
    const badges = {
        male: '<span class="badge badge-male">Male</span>',
        female: '<span class="badge badge-female">Female</span>',
        other: '<span class="badge badge-other">Other</span>'
    };
    return badges[sex] || sex;
}

// Update patient count
function updatePatientCount(count) {
    patientCount.textContent = `${count} patient${count !== 1 ? 's' : ''}`;
}

// View patient details
window.viewPatient = function(patientId) {
    const patient = allPatients.find(p => p.id === patientId);
    if (patient) {
        alert(`Patient Details:\n\nName: ${patient.name}\nID: ${patient.patient_id}\nSex: ${patient.sex}\nCreated: ${new Date(patient.created_at).toLocaleString()}`);
    }
};

// Delete patient
window.deletePatient = async function(patientId, patientIdDisplay) {
    if (!confirm(`Are you sure you want to delete patient ${patientIdDisplay}?`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', patientId);
        
        if (error) throw error;
        
        // Remove from local array
        allPatients = allPatients.filter(p => p.id !== patientId);
        displayPatients(allPatients);
        updatePatientCount(allPatients.length);
        
        alert('Patient deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient: ' + error.message);
    }
};

// Search functionality
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            displayPatients(allPatients);
            updatePatientCount(allPatients.length);
            return;
        }
        
        const filtered = allPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.patient_id.toLowerCase().includes(searchTerm)
        );
        
        displayPatients(filtered);
        updatePatientCount(filtered.length);
    }, 300);
});

// Modal - Open
addBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Modal - Close
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
});

// Modal - Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        form.reset();
    }
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('patientName').value;
    const patientId = document.getElementById('patientId').value;
    const sex = document.getElementById('patientSex').value;
    const submitBtn = form.querySelector('.btn-create');
    
    // Show loading
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;
    
    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([{
                patient_id: patientId,
                name: name,
                sex: sex
            }])
            .select();
        
        if (error) throw error;
        
        alert(`Patient profile created successfully!\nName: ${name}\nID: ${patientId}\nSex: ${sex}`);
        
        // Add to local array and refresh display
        allPatients.unshift(data[0]);
        displayPatients(allPatients);
        updatePatientCount(allPatients.length);
        
        // Reset and close
        form.reset();
        modal.style.display = 'none';
        
    } catch (error) {
        console.error('Error creating patient:', error);
        alert('Error creating patient: ' + error.message);
    } finally {
        submitBtn.textContent = 'Create Profile';
        submitBtn.disabled = false;
    }
});