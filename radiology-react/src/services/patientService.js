import { supabase } from '../lib/supabase'

export const patientService = {
  // Generate next Patient ID (PAT-2025-0001, PAT-2025-0002, etc.)
  async generatePatientId() {
    try {
      const currentYear = new Date().getFullYear()
      const yearPrefix = `PAT-${currentYear}-`

      const { data, error } = await supabase
        .from('patients')
        .select('patient_id')
        .not('patient_id', 'is', null)
        .like('patient_id', `${yearPrefix}%`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        return `${yearPrefix}0001`
      }

      let highestNumber = 0
      for (const record of data) {
        if (record.patient_id && record.patient_id.startsWith(yearPrefix)) {
          const match = record.patient_id.match(/^PAT-\d{4}-(\d{4})$/)
          if (match) {
            const number = parseInt(match[1])
            if (number > highestNumber) {
              highestNumber = number
            }
          }
        }
      }

      const nextNumber = highestNumber + 1
      if (nextNumber > 9999) {
        throw new Error('Patient ID limit reached for this year (9999)')
      }

      return `${yearPrefix}${nextNumber.toString().padStart(4, '0')}`
    } catch (error) {
      console.error('Generate patient ID error:', error)
      const currentYear = new Date().getFullYear()
      return `PAT-${currentYear}-0001`
    }
  },

  async createPatient(patientData) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) throw error
      return { success: true, patient: data }
    } catch (error) {
      console.error('Create patient error:', error)
      return { success: false, message: error.message }
    }
  },

  async getAllPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, patients: data }
    } catch (error) {
      console.error('Get patients error:', error)
      return { success: false, message: error.message }
    }
  },

  async searchPatients(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, patients: data }
    } catch (error) {
      console.error('Search patients error:', error)
      return { success: false, message: error.message }
    }
  },

  async getPatientDetail(patientId) {
    try {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (patientError) throw patientError

      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      const { data: studies, error: studiesError } = await supabase
        .from('studies')
        .select('*')
        .eq('patient_uuid', patientId)
        .order('created_at', { ascending: false })

      // Get study IDs that already have reports
      const reportedStudyIds = (reports || [])
        .filter(r => r.study_id)
        .map(r => r.study_id)
      
      // Filter studies: exclude completed ones and ones that already have reports
      const pendingStudies = (studies || []).filter(s => 
        s.status !== 'completed' && !reportedStudyIds.includes(s.study_id)
      )
      
      const combinedAppointments = [
        ...(reports || []).map(r => ({ ...r, type: 'report' })),
        ...pendingStudies.map(s => ({ ...s, type: 'study' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      return {
        success: true,
        patient: patient,
        appointments: combinedAppointments,
        reports: reports || [],
        studies: studies || []
      }
    } catch (error) {
      console.error('Get patient detail error:', error)
      return { success: false, message: error.message }
    }
  },

  async updatePatient(patientId, patientData) {
    try {
      const updatedData = {
        ...patientData,
        name: `${patientData.first_name} ${patientData.last_name}`,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updatedData)
        .eq('id', patientId)
        .select()
        .single()

      if (error) throw error
      return { success: true, patient: data }
    } catch (error) {
      console.error('Update patient error:', error)
      return { success: false, message: error.message }
    }
  }
}
