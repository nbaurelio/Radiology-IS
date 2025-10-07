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
    // Generate next Patient ID (PAT-0001, PAT-0002, ..., PAT-9999, PAT-A0000, etc.)
    async generatePatientId() {
        try {
            // Get the highest patient_id from patients table
            const { data, error } = await supabase
                .from('patients')
                .select('patient_id')
                .not('patient_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(100); // Get last 100 to find the highest

            if (error) throw error;

            if (!data || data.length === 0) {
                return 'PAT-0001'; // First ID
            }

            // Find the highest patient ID
            let highestId = 'PAT-0000';
            for (const record of data) {
                if (record.patient_id && record.patient_id.startsWith('PAT-')) {
                    if (this.comparePatientIds(record.patient_id, highestId) > 0) {
                        highestId = record.patient_id;
                    }
                }
            }

            return this.incrementPatientId(highestId);
        } catch (error) {
            console.error('Generate patient ID error:', error);
            return 'PAT-0001'; // Fallback to first ID
        }
    },

    // Compare two patient IDs (returns 1 if a > b, -1 if a < b, 0 if equal)
    comparePatientIds(a, b) {
        const parseId = (id) => {
            const match = id.match(/^PAT-([A-Z]*)(\d+)$/);
            if (!match) return { prefix: '', number: 0 };
            return { prefix: match[1], number: parseInt(match[2]) };
        };

        const idA = parseId(a);
        const idB = parseId(b);

        // Compare prefix length first (longer prefix = higher)
        if (idA.prefix.length !== idB.prefix.length) {
            return idA.prefix.length - idB.prefix.length;
        }

        // Compare prefix alphabetically
        if (idA.prefix !== idB.prefix) {
            return idA.prefix.localeCompare(idB.prefix);
        }

        // Compare numbers
        return idA.number - idB.number;
    },

    // Increment Patient ID
    incrementPatientId(lastId) {
        const match = lastId.match(/^PAT-([A-Z]*)(\d+)$/);
        if (!match) return 'PAT-0001';

        let prefix = match[1];
        let number = parseInt(match[2]);

        number++;

        // If number exceeds 9999, increment prefix
        if (number > 9999) {
            number = 0;
            prefix = this.incrementPrefix(prefix);
        }

        return `PAT-${prefix}${number.toString().padStart(4, '0')}`;
    },

    // Increment prefix ('' → 'A', 'A' → 'B', 'Z' → 'AA', 'AZ' → 'BA', etc.)
    incrementPrefix(prefix) {
        if (!prefix) return 'A';
        
        // Convert prefix to array of characters
        const chars = prefix.split('');
        
        // Start from the rightmost character
        for (let i = chars.length - 1; i >= 0; i--) {
            if (chars[i] === 'Z') {
                chars[i] = 'A';
                // If this was the leftmost character, add a new 'A' at the start
                if (i === 0) {
                    return 'A' + chars.join('');
                }
                // Otherwise continue to increment the next character
            } else {
                // Increment this character and we're done
                chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
                return chars.join('');
            }
        }
        
        return chars.join('');
    },

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
    // Create new study (from DICOM upload)
    async createStudy(studyData) {
        try {
            const { data, error } = await supabase
                .from('studies')
                .insert([studyData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, study: data };
        } catch (error) {
            console.error('Create study error:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all studies
    async getAllStudies() {
        try {
            const { data, error } = await supabase
                .from('studies')
                .select(`
                    *,
                    patients(id, patient_id, first_name, last_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, studies: data };
        } catch (error) {
            console.error('Get studies error:', error);
            return { success: false, message: error.message };
        }
    },

    // Get pending studies (for worklist)
    async getPendingStudies() {
        try {
            const { data, error } = await supabase
                .from('studies')
                .select(`
                    *,
                    patients(id, patient_id, first_name, last_name)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, studies: data };
        } catch (error) {
            console.error('Get pending studies error:', error);
            return { success: false, message: error.message };
        }
    },

    // Get study by ID
    async getStudyById(studyId) {
        try {
            const { data, error } = await supabase
                .from('studies')
                .select(`
                    *,
                    patients(id, patient_id, first_name, last_name, date_of_birth, sex, phone, email)
                `)
                .eq('id', studyId)
                .single();

            if (error) throw error;
            return { success: true, study: data };
        } catch (error) {
            console.error('Get study error:', error);
            return { success: false, message: error.message };
        }
    },

    // Update study status
    async updateStudyStatus(studyId, status) {
        try {
            const { data, error } = await supabase
                .from('studies')
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', studyId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, study: data };
        } catch (error) {
            console.error('Update study status error:', error);
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
    },

    // Generate next Study ID (STU-0001, STU-0002, ..., STU-9999, STU-A0000, etc.)
    async generateStudyId() {
        try {
            // Get the highest study_id from reports table
            const { data, error } = await supabase
                .from('reports')
                .select('study_id')
                .not('study_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(100); // Get last 100 to find the highest

            if (error) throw error;

            if (!data || data.length === 0) {
                return 'STU-0001'; // First ID
            }

            // Find the highest study ID
            let highestId = 'STU-0000';
            for (const record of data) {
                if (record.study_id && record.study_id.startsWith('STU-')) {
                    if (this.compareStudyIds(record.study_id, highestId) > 0) {
                        highestId = record.study_id;
                    }
                }
            }

            return this.incrementStudyId(highestId);
        } catch (error) {
            console.error('Generate study ID error:', error);
            return 'STU-0001'; // Fallback to first ID
        }
    },

    // Compare two study IDs (returns 1 if a > b, -1 if a < b, 0 if equal)
    compareStudyIds(a, b) {
        const parseId = (id) => {
            const match = id.match(/^STU-([A-Z]*)(\d+)$/);
            if (!match) return { prefix: '', number: 0 };
            return { prefix: match[1], number: parseInt(match[2]) };
        };

        const idA = parseId(a);
        const idB = parseId(b);

        // Compare prefix length first (longer prefix = higher)
        if (idA.prefix.length !== idB.prefix.length) {
            return idA.prefix.length - idB.prefix.length;
        }

        // Compare prefix alphabetically
        if (idA.prefix !== idB.prefix) {
            return idA.prefix.localeCompare(idB.prefix);
        }

        // Compare numbers
        return idA.number - idB.number;
    },

    // Increment Study ID
    incrementStudyId(lastId) {
        const match = lastId.match(/^STU-([A-Z]*)(\d+)$/);
        if (!match) return 'STU-0001';

        let prefix = match[1];
        let number = parseInt(match[2]);

        number++;

        // If number exceeds 9999, increment prefix
        if (number > 9999) {
            number = 0;
            prefix = this.incrementPrefix(prefix);
        }

        return `STU-${prefix}${number.toString().padStart(4, '0')}`;
    },

    // Increment prefix ('' → 'A', 'A' → 'B', 'Z' → 'AA', 'AZ' → 'BA', etc.)
    incrementPrefix(prefix) {
        if (!prefix) return 'A';
        
        // Convert prefix to array of characters
        const chars = prefix.split('');
        
        // Start from the rightmost character
        for (let i = chars.length - 1; i >= 0; i--) {
            if (chars[i] === 'Z') {
                chars[i] = 'A';
                // If this was the leftmost character, add a new 'A' at the start
                if (i === 0) {
                    return 'A' + chars.join('');
                }
                // Otherwise continue to increment the next character
            } else {
                // Increment this character and we're done
                chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
                return chars.join('');
            }
        }
        
        return chars.join('');
    }
};