import { supabase } from '../lib/supabase'

export const reportService = {
  async getAllReports(limit = 50) {
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          patients(id, patient_id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (reportsError) {
        console.error('Supabase error in getAllReports:', reportsError)
        throw reportsError
      }
      
      return { success: true, reports: reports || [] }
    } catch (error) {
      console.error('Get reports error:', error)
      return { success: false, message: error.message, reports: [] }
    }
  },

  async searchReports(searchTerm) {
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          patients(id, patient_id, first_name, last_name)
        `)
        .or(`study_id.ilike.%${searchTerm}%,exam_type.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,assigned_radiologist.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (reportsError) {
        console.error('Supabase error in searchReports:', reportsError)
        throw reportsError
      }
      
      return { success: true, reports: reports || [] }
    } catch (error) {
      console.error('Search reports error:', error)
      return { success: false, message: error.message, reports: [] }
    }
  },

// reportService.js - Updated createReport function

  async createReport(reportData) {
    try {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('id', reportData.patient_id)
        .single()

      if (patientError || !patient) {
        return { success: false, message: 'Patient does not exist. Please select a valid patient.' }
      }

      const currentUser = JSON.parse(localStorage.getItem('userSession') || '{}')
      
      const insertData = {
        study_id: reportData.study_id || null,
        patient_id: reportData.patient_id,
        name: `${patient.first_name} ${patient.last_name}`,
        exam_type: reportData.exam_type,
        study_date: reportData.study_date || reportData.appointment_date,
        schedule: reportData.appointment_date || null,
        status: 'finalized', // ← Report status is finalized when created
        modality: reportData.modality || null,
        priority: reportData.priority || 'routine',
        assigned_radiologist: reportData.assigned_radiologist || null,
        assigned_radiologist_id: reportData.assigned_radiologist_id || null,
        notes: reportData.notes || null,
        findings: reportData.findings || null,
        impression: reportData.impression || null,
        recommendations: reportData.recommendations || null,
        created_by: currentUser?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        notification_sent: false
      }
      
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert([insertData])
        .select()
        .single()

      if (reportError) {
        console.error('Report insert error details:', reportError)
        throw reportError
      }

      // Update linked study status to 'finalized' after report is created
      if (insertData.study_id) {
        const { data: studies } = await supabase
          .from('studies')
          .select('id')
          .eq('study_id', insertData.study_id)
          .limit(1)

        if (studies && studies.length > 0) {
          await supabase
            .from('studies')
            .update({ 
              status: 'finalized', // ← Study becomes finalized when report is created
              updated_at: new Date().toISOString()
            })
            .eq('id', studies[0].id)
        }
      }

      return { success: true, report: report }
    } catch (error) {
      console.error('Create report error:', error)
      return { success: false, message: error.message }
    }
  },

  async getReportById(reportId) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .select(`
          *,
          patients(*)
        `)
        .eq('id', reportId)
        .single()

      if (error) throw error
      
      return { success: true, report: report }
    } catch (error) {
      console.error('Get report by ID error:', error)
      return { success: false, message: error.message, report: null }
    }
  },

  async updateReport(reportId, updateData) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', reportId)
        .select(`
          *,
          patients(*)
        `)
        .single()

      if (error) throw error
      
      return { success: true, report: report }
    } catch (error) {
      console.error('Update report error:', error)
      return { success: false, message: error.message }
    }
  },

  async getAllPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, patient_id, first_name, last_name')
        .order('first_name', { ascending: true })

      if (error) throw error
      return { success: true, patients: data }
    } catch (error) {
      console.error('Get patients error:', error)
      return { success: false, message: error.message }
    }
  },

  async generateStudyId() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('study_id')
        .not('study_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        return 'STU-0001'
      }

      let highestId = 'STU-0000'
      for (const record of data) {
        if (record.study_id && record.study_id.startsWith('STU-')) {
          if (this.compareStudyIds(record.study_id, highestId) > 0) {
            highestId = record.study_id
          }
        }
      }

      return this.incrementStudyId(highestId)
    } catch (error) {
      console.error('Generate study ID error:', error)
      return 'STU-0001'
    }
  },

  compareStudyIds(a, b) {
    const parseId = (id) => {
      const match = id.match(/^STU-([A-Z]*)(\d+)$/)
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

  incrementStudyId(lastId) {
    const match = lastId.match(/^STU-([A-Z]*)(\d+)$/)
    if (!match) return 'STU-0001'

    let prefix = match[1]
    let number = parseInt(match[2])

    number++

    if (number > 9999) {
      number = 0
      prefix = this.incrementPrefix(prefix)
    }

    return `STU-${prefix}${number.toString().padStart(4, '0')}`
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

  async deleteReport(reportId) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Delete report error:', error)
      return { success: false, message: error.message }
    }
  }
}
