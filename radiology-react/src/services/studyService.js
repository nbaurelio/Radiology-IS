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
      const currentYear = new Date().getFullYear()
      const yearPrefix = `STU-${currentYear}-`

      const { data, error } = await supabase
        .from('studies')
        .select('study_id')
        .not('study_id', 'is', null)
        .like('study_id', `${yearPrefix}%`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        return `${yearPrefix}0001`
      }

      let highestNumber = 0
      for (const record of data) {
        if (record.study_id && record.study_id.startsWith(yearPrefix)) {
          const match = record.study_id.match(/^STU-\d{4}-(\d{4})$/)
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
        throw new Error('Study ID limit reached for this year (9999)')
      }

      return `${yearPrefix}${nextNumber.toString().padStart(4, '0')}`
    } catch (error) {
      console.error('Generate study ID error:', error)
      const currentYear = new Date().getFullYear()
      return `STU-${currentYear}-0001`
    }
  },

  async uploadDicomFiles(studyUuid, studyId, files) {
    try {
      let uploadedCount = 0
      const errors = []

      for (const file of files) {
        try {
          // Create file path: studyId/filename
          const filePath = `${studyId}/${file.name}`

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('dicom-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error(`Failed to upload ${file.name}:`, uploadError)
            errors.push(`${file.name}: ${uploadError.message}`)
            continue
          }

          // Save file record to database
          const { error: dbError } = await supabase
            .from('dicom_files')
            .insert({
              study_id: studyUuid,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type || 'application/octet-stream'
            })

          if (dbError) {
            console.error(`Failed to save file record for ${file.name}:`, dbError)
            errors.push(`${file.name}: Database error`)
            continue
          }

          uploadedCount++
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError)
          errors.push(`${file.name}: ${fileError.message}`)
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          uploadedCount,
          message: `Uploaded ${uploadedCount}/${files.length} files. Errors: ${errors.join(', ')}`
        }
      }

      return {
        success: true,
        uploadedCount,
        message: `Successfully uploaded ${uploadedCount} files`
      }
    } catch (error) {
      console.error('Upload DICOM files error:', error)
      return {
        success: false,
        uploadedCount: 0,
        message: error.message
      }
    }
  }
}
