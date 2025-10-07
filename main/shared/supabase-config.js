// Supabase Configuration
const SUPABASE_URL = 'https://sazosfxthfouurqjyyhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhem9zZnh0aGZvdXVycWp5eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTg3NDcsImV4cCI6MjA3NTEzNDc0N30.XnHbXw1yo_I1c7W4_9J5SaC_7Qp821tfq_LkvgClTc8';

// Initialize Supabase client (using CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to hash passwords (simple version - use bcrypt in production)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Authentication functions
const authService = {
    // Login user
    async login(userId, password) {
        try {
            const hashedPassword = await hashPassword(password);
            
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    user_types(type_name)
                `)
                .eq('user_id', userId)
                .eq('password_hash', hashedPassword)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            
            if (data) {
                // Store user session in localStorage
                const session = {
                    id: data.id,
                    userId: data.user_id,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    email: data.email,
                    userType: data.user_types.type_name,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('userSession', JSON.stringify(session));
                return { success: true, user: session };
            } else {
                return { success: false, message: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('userSession');
        window.location.href = '../Login/login.html';
    },

    // Get current user session
    getCurrentUser() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    },

    // Check if user is logged in
    isAuthenticated() {
        return localStorage.getItem('userSession') !== null;
    },

    // Check user type
    hasUserType(requiredType) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (Array.isArray(requiredType)) {
            return requiredType.includes(user.userType);
        }
        return user.userType === requiredType;
    }
};

// Patient management functions
const patientService = {
    // Create new patient
    async createPatient(patientData) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .insert([patientData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, patient: data };
        } catch (error) {
            console.error('Create patient error:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all patients
    async getAllPatients() {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, patients: data };
        } catch (error) {
            console.error('Get patients error:', error);
            return { success: false, message: error.message };
        }
    },

    // Search patients
    async searchPatients(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, patients: data };
        } catch (error) {
            console.error('Search patients error:', error);
            return { success: false, message: error.message };
        }
    }
};

// Study management functions
const studyService = {
    // Get recent studies for dashboard
    async getRecentStudies(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('studies')
                .select(`
                    *,
                    patients(first_name, last_name, patient_id),
                    assigned_radiologist:users!assigned_radiologist_id(first_name, last_name)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, studies: data };
        } catch (error) {
            console.error('Get studies error:', error);
            return { success: false, message: error.message };
        }
    },

    // Get dashboard statistics
    async getDashboardStats() {
        try {
            // Total studies
            const { count: totalStudies } = await supabase
                .from('studies')
                .select('*', { count: 'exact', head: true });

            // Pending reads
            const { count: pendingReads } = await supabase
                .from('studies')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Urgent studies
            const { count: urgentStudies } = await supabase
                .from('studies')
                .select('*', { count: 'exact', head: true })
                .in('priority', ['urgent', 'stat']);

            // Active patients
            const { count: activePatients } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true });

            return {
                success: true,
                stats: {
                    totalStudies: totalStudies || 0,
                    pendingReads: pendingReads || 0,
                    urgentStudies: urgentStudies || 0,
                    activePatients: activePatients || 0
                }
            };
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return { success: false, message: error.message };
        }
    }

    
};

// Patient detail functions
const patientDetailService = {
    // Get full patient details with appointments and studies
    async getPatientDetail(patientId) {
        try {
            // Get patient info
            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single();

            if (patientError) throw patientError;

            // Get patient's reports (these will be shown as appointments)
            const { data: reports, error: reportsError } = await supabase
                .from('reports')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            // Get patient's studies
            const { data: studies, error: studiesError } = await supabase
                .from('studies')
                .select('*')
                .eq('patient_id', patientId)
                .order('study_date', { ascending: false });

            return {
                success: true,
                patient: patient,
                appointments: reports || [], // Use reports as appointments
                studies: studies || []
            };
        } catch (error) {
            console.error('Get patient detail error:', error);
            return { success: false, message: error.message };
        }
    }
};

// Report Service
const reportService = {
    // Get all radiology reports with patient info
    async getAllReports(limit = 50) {
        try {
            const { data: reports, error: reportsError } = await supabase
                .from('reports')
                .select(`
                    *,
                    patients(id, patient_id, first_name, last_name)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (reportsError) {
                console.error('Supabase error in getAllReports:', reportsError);
                throw reportsError;
            }
            
            return { success: true, reports: reports || [] };
        } catch (error) {
            console.error('Get reports error:', error);
            return { success: false, message: error.message, reports: [] };
        }
    },

    // Search reports by patient name, exam type, study ID, or status
    async searchReports(searchTerm) {
        try {
            const { data: reports, error: reportsError } = await supabase
                .from('reports')
                .select(`
                    *,
                    patients(id, patient_id, first_name, last_name)
                `)
                .or(`study_id.ilike.%${searchTerm}%,exam_type.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,assigned_radiologist.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (reportsError) {
                console.error('Supabase error in searchReports:', reportsError);
                throw reportsError;
            }
            
            return { success: true, reports: reports || [] };
        } catch (error) {
            console.error('Search reports error:', error);
            return { success: false, message: error.message, reports: [] };
        }
    },

    // Create new radiology report
    async createReport(reportData) {
        try {
            // First, verify patient exists
            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .select('id, first_name, last_name')
                .eq('id', reportData.patient_id)
                .single();

            if (patientError || !patient) {
                return { success: false, message: 'Patient does not exist. Please select a valid patient.' };
            }

            // Create the radiology report
            const currentUser = authService.getCurrentUser();
            
            // Try without report_status first to see if it has a default
            const insertData = {
                study_id: reportData.study_id || null,
                patient_id: reportData.patient_id,
                name: `${patient.first_name} ${patient.last_name}`,
                exam_type: reportData.exam_type,
                study_date: reportData.study_date || reportData.appointment_date,
                schedule: reportData.appointment_date || null,
                status: reportData.status || 'pending',
                modality: reportData.modality || null,
                priority: reportData.priority || 'routine',
                assigned_radiologist: reportData.assigned_radiologist || null,
                assigned_radiologist_id: reportData.assigned_radiologist_id || null,
                notes: reportData.notes || null,
                created_by: currentUser?.id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
                notification_sent: false
            };
            
            console.log('Attempting to insert report with data:', insertData);
            
            const { data: report, error: reportError } = await supabase
                .from('reports')
                .insert([insertData])
                .select()
                .single();

            if (reportError) {
                console.error('Report insert error details:', reportError);
                throw reportError;
            }

            return { success: true, report: report };
        } catch (error) {
            console.error('Create report error:', error);
            console.error('Error details:', error.details, error.hint, error.code);
            return { success: false, message: error.message };
        }
    },

    // Get all patients for dropdown
    async getAllPatients() {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('id, patient_id, first_name, last_name')
                .order('first_name', { ascending: true });

            if (error) throw error;
            return { success: true, patients: data };
        } catch (error) {
            console.error('Get patients error:', error);
            return { success: false, message: error.message };
        }
    }
};