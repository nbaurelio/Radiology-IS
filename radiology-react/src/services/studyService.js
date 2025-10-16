import { supabase } from '../lib/supabase'

export const studyService = {
  async createStudy(studyData) {
    try {
      const { data, error } = await supabase
        .from('studies')
        .insert([studyData])
        .select()
        .single()

      if (error) throw error
      return { success: true, study: data }
    } catch (error) {
      console.error('Create study error:', error)
      return { success: false, message: error.message }
    }
  },

  async getAllStudies() {
    try {
      const { data, error } = await supabase
        .from('studies')
        .select(`
          *,
          patients(id, patient_id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, studies: data }
    } catch (error) {
      console.error('Get studies error:', error)
      return { success: false, message: error.message }
    }
  },

  async getRecentStudies(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('studies')
        .select(`
          study_id,
          patient_uuid,
          created_at,
          priority,
          status,
          patients:patients!fk_patient (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, studies: data || [] }
    } catch (error) {
      console.error('Get recent studies error:', error)
      return { success: false, error }
    }
  },

  async getPendingStudies() {
    try {
      const { data, error } = await supabase
        .from('studies')
        .select(`
          *,
          patients(id, patient_id, first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, studies: data }
    } catch (error) {
      console.error('Get pending studies error:', error)
      return { success: false, message: error.message }
    }
  },

  async getStudyById(studyId) {
    try {
      const { data, error } = await supabase
        .from('studies')
        .select(`
          *,
          patients(id, patient_id, first_name, last_name, date_of_birth, sex, phone, email)
        `)
        .eq('id', studyId)
        .single()

      if (error) throw error
      return { success: true, study: data }
    } catch (error) {
      console.error('Get study error:', error)
      return { success: false, message: error.message }
    }
  },

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
        .single()

      if (error) throw error
      return { success: true, study: data }
    } catch (error) {
      console.error('Update study status error:', error)
      return { success: false, message: error.message }
    }
  },

  async getDashboardStats() {
    try {
      const { count: totalStudies } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })

      const { count: pendingReads } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: urgentStudies } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
        .in('priority', ['urgent', 'stat'])

      const { count: activePatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      return {
        success: true,
        stats: {
          totalStudies: totalStudies || 0,
          pendingReads: pendingReads || 0,
          urgentStudies: urgentStudies || 0,
          activePatients: activePatients || 0
        }
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return { success: false, message: error.message }
    }
  },

  async generateStudyId() {
    try {
      const { data, error } = await supabase
        .from('studies')
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
  }
}
