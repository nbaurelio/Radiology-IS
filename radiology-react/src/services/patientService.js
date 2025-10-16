import { supabase } from '../lib/supabase'

export const patientService = {
  // Generate next Patient ID (PAT-0001, PAT-0002, ..., PAT-9999, PAT-A0000, etc.)
  async generatePatientId() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('patient_id')
        .not('patient_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        return 'PAT-0001'
      }

      let highestId = 'PAT-0000'
      for (const record of data) {
        if (record.patient_id && record.patient_id.startsWith('PAT-')) {
          if (this.comparePatientIds(record.patient_id, highestId) > 0) {
            highestId = record.patient_id
          }
        }
      }

      return this.incrementPatientId(highestId)
    } catch (error) {
      console.error('Generate patient ID error:', error)
      return 'PAT-0001'
    }
  },

  comparePatientIds(a, b) {
    const parseId = (id) => {
      const match = id.match(/^PAT-([A-Z]*)(\d+)$/)
      if (!match) return { prefix: '', number: 0 }
      return { prefix: match[1], number: parseInt(match[2]) }
    }

    const idA = parseId(a)
    const idB = parseId(b)

    if (idA.prefix.length !== idB.prefix.length) {
      return idA.prefix.length - idB.prefix.length
    }

    if (idA.prefix !== idB.prefix) {
      return idA.prefix.localeCompare(idB.prefix)
    }

    return idA.number - idB.number
  },

  incrementPatientId(lastId) {
    const match = lastId.match(/^PAT-([A-Z]*)(\d+)$/)
    if (!match) return 'PAT-0001'

    let prefix = match[1]
    let number = parseInt(match[2])

    number++

    if (number > 9999) {
      number = 0
      prefix = this.incrementPrefix(prefix)
    }

    return `PAT-${prefix}${number.toString().padStart(4, '0')}`
  },

  incrementPrefix(prefix) {
    if (!prefix) return 'A'
    
    const chars = prefix.split('')
    
    for (let i = chars.length - 1; i >= 0; i--) {
      if (chars[i] === 'Z') {
        chars[i] = 'A'
        if (i === 0) {
          return 'A' + chars.join('')
        }
      } else {
        chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1)
        return chars.join('')
      }
    }
    
    return chars.join('')
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

      const pendingStudies = (studies || []).filter(s => s.status !== 'completed')
      
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
  }
}
