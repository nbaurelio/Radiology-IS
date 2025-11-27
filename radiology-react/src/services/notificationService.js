/**
 * Notification Service
 * Handles all notification types and triggers based on features and roles
 */

// Notification Types
export const NOTIFICATION_TYPES = {
  // DICOM Upload & Management
  STUDY_UPLOADED: 'study_uploaded',
  STUDY_REASSIGNED: 'study_reassigned',
  UPLOAD_SUCCESS: 'upload_success',
  UPLOAD_FAILED: 'upload_failed',
  STUDY_VALIDATED: 'study_validated',
  
  // Third-Party Viewer & Reporting
  STUDY_ASSIGNED: 'study_assigned',
  STUDY_SLA_WARNING: 'study_sla_warning',
  READING_STARTED: 'reading_started',
  REPORT_FINALIZED: 'report_finalized',
  VIEWER_ERROR: 'viewer_error',
  
  // Telehealth Integration
  EXAM_REQUEST_RECEIVED: 'exam_request_received',
  EXAM_REQUEST_UPDATED: 'exam_request_updated',
  TELEHEALTH_STUDY: 'telehealth_study',
  TELEHEALTH_API_ERROR: 'telehealth_api_error',
  
  // Report Generation
  INCOMPLETE_REPORTS_REMINDER: 'incomplete_reports_reminder',
  REPORT_AVAILABLE: 'report_available',
  REPORT_AMENDMENT_REQUEST: 'report_amendment_request',
  
  // Patient Scheduling
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  SAME_DAY_REMINDER: 'same_day_reminder',
  PATIENT_CHECKED_IN: 'patient_checked_in',
  PATIENT_NO_SHOW: 'patient_no_show',
  
  // Secure Sharing & Access
  FAILED_LOGIN_ATTEMPTS: 'failed_login_attempts',
  REPORT_SHARED: 'report_shared',
  UNUSUAL_ACCESS: 'unusual_access',
  EXTERNAL_LINK_GENERATED: 'external_link_generated'
}

// Priority Levels
export const PRIORITY_LEVELS = {
  ROUTINE: 'routine',
  URGENT: 'urgent',
  STAT: 'stat'
}

// User Roles
export const USER_ROLES = {
  RADIOLOGIST: 'radiologist',
  RAD_TECH: 'rad_tech',
  REFERRING_PHYSICIAN: 'referring_physician',
  ADMIN: 'admin',
  SCHEDULING_STAFF: 'scheduling_staff',
  FRONT_DESK: 'front_desk'
}

/**
 * Create notification payload
 */
export const createNotification = ({
  type,
  title,
  message,
  priority = PRIORITY_LEVELS.ROUTINE,
  recipientRole,
  linkedEntity = {},
  actionLink = null,
  autoRemove = true
}) => {
  return {
    type,
    title,
    message,
    priority,
    recipientRole,
    linkedEntity, // { patient_id, study_id, appointment_id, etc. }
    actionLink,
    autoRemove
  }
}

/**
 * DICOM Upload & Management Notifications
 */
export const notifyStudyUploaded = (studyData) => {
  const { patient_name, patient_id, exam_type, modality, is_stat } = studyData
  
  return createNotification({
    type: NOTIFICATION_TYPES.STUDY_UPLOADED,
    title: is_stat ? '🔴 STAT Study Uploaded' : 'New Study Uploaded',
    message: `${modality} ${exam_type} - Patient: ${patient_name} (ID: ${patient_id})`,
    priority: is_stat ? PRIORITY_LEVELS.STAT : PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RADIOLOGIST,
    linkedEntity: { study_id: studyData.study_id, patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyStudyReassigned = (studyData, fromRadiologist, toRadiologist) => {
  return createNotification({
    type: NOTIFICATION_TYPES.STUDY_REASSIGNED,
    title: 'Study Reassigned to You',
    message: `${studyData.modality} ${studyData.exam_type} reassigned by ${fromRadiologist}. Patient: ${studyData.patient_name}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RADIOLOGIST,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyUploadSuccess = (studyData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.UPLOAD_SUCCESS,
    title: '✅ DICOM Upload Successful',
    message: `${studyData.modality} ${studyData.exam_type} for ${studyData.patient_name} uploaded successfully`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/uploads/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyUploadFailed = (studyData, error) => {
  return createNotification({
    type: NOTIFICATION_TYPES.UPLOAD_FAILED,
    title: '❌ Upload Failed',
    message: `Failed to upload DICOM: ${error}. Please check file format and metadata.`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { patient_id: studyData.patient_id },
    autoRemove: false
  })
}

export const notifyStudyValidated = (studyData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.STUDY_VALIDATED,
    title: '✓ Study Validated',
    message: `${studyData.modality} ${studyData.exam_type} passed validation and is now in the worklist`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

/**
 * Third-Party Viewer & Reporting Notifications
 */
export const notifyStudyAssigned = (studyData, radiologistName) => {
  return createNotification({
    type: NOTIFICATION_TYPES.STUDY_ASSIGNED,
    title: '📋 Study Assigned',
    message: `${studyData.modality} ${studyData.exam_type} assigned by ${radiologistName}. Patient: ${studyData.patient_name}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RADIOLOGIST,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyStudySLAWarning = (studyData, hoursElapsed) => {
  return createNotification({
    type: NOTIFICATION_TYPES.STUDY_SLA_WARNING,
    title: '⏰ SLA Warning',
    message: `Study #${studyData.study_id} has been pending for ${hoursElapsed} hours. Priority reading needed.`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.RADIOLOGIST,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyReadingStarted = (studyData, radiologistName) => {
  return createNotification({
    type: NOTIFICATION_TYPES.READING_STARTED,
    title: '👁️ Reading Started',
    message: `${radiologistName} started reading ${studyData.modality} ${studyData.exam_type} for ${studyData.patient_name}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`
  })
}

export const notifyReportFinalized = (studyData, radiologistName) => {
  return createNotification({
    type: NOTIFICATION_TYPES.REPORT_FINALIZED,
    title: '📄 Report Finalized',
    message: `${radiologistName} finalized report for ${studyData.modality} - ${studyData.patient_name}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/reports/${studyData.report_id}`,
    autoRemove: false
  })
}

export const notifyViewerError = (studyData, error) => {
  return createNotification({
    type: NOTIFICATION_TYPES.VIEWER_ERROR,
    title: '⚠️ Viewer Integration Error',
    message: `Cannot launch viewer for Study #${studyData.study_id}: ${error}`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.ADMIN,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/admin/viewer-logs`,
    autoRemove: false
  })
}

/**
 * Telehealth Integration Notifications
 */
export const notifyExamRequestReceived = (examData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.EXAM_REQUEST_RECEIVED,
    title: '🔔 New Telehealth Exam Request',
    message: `${examData.exam_type} requested for ${examData.patient_name}. Referred by: ${examData.referring_physician}`,
    priority: examData.is_urgent ? PRIORITY_LEVELS.URGENT : PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { exam_id: examData.exam_id, patient_id: examData.patient_id },
    actionLink: `/telehealth/requests/${examData.exam_id}`,
    autoRemove: false
  })
}

export const notifyExamRequestUpdated = (examData, updateType) => {
  const messages = {
    rescheduled: `Telehealth exam rescheduled to ${examData.new_date}`,
    cancelled: 'Telehealth exam cancelled',
    confirmed: 'Telehealth exam confirmed'
  }

  return createNotification({
    type: NOTIFICATION_TYPES.EXAM_REQUEST_UPDATED,
    title: '🔄 Exam Request Updated',
    message: messages[updateType] || `Exam request updated: ${updateType}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { exam_id: examData.exam_id, patient_id: examData.patient_id },
    actionLink: `/telehealth/requests/${examData.exam_id}`
  })
}

export const notifyTelehealthStudy = (studyData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.TELEHEALTH_STUDY,
    title: '📡 Telehealth Study Pending',
    message: `${studyData.exam_type} from telehealth platform. Patient: ${studyData.patient_name}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RADIOLOGIST,
    linkedEntity: { study_id: studyData.study_id, patient_id: studyData.patient_id },
    actionLink: `/studies/${studyData.study_id}`,
    autoRemove: false
  })
}

export const notifyTelehealthAPIError = (error) => {
  return createNotification({
    type: NOTIFICATION_TYPES.TELEHEALTH_API_ERROR,
    title: '⚠️ Telehealth API Error',
    message: `Failed to sync with telehealth platform: ${error}`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.ADMIN,
    actionLink: `/admin/telehealth-logs`,
    autoRemove: false
  })
}

/**
 * Report Generation Notifications
 */
export const notifyIncompleteReportsReminder = (incompleteCount) => {
  return createNotification({
    type: NOTIFICATION_TYPES.INCOMPLETE_REPORTS_REMINDER,
    title: '📝 Incomplete Reports',
    message: `You have ${incompleteCount} completed studies without finalized reports.`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RADIOLOGIST,
    actionLink: `/reports?status=pending`,
    autoRemove: false
  })
}

export const notifyReportAvailable = (reportData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.REPORT_AVAILABLE,
    title: '📄 New Imaging Report Available',
    message: `A new imaging report is available for your patient ${reportData.patient_name} (ID: ${reportData.patient_id})`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.REFERRING_PHYSICIAN,
    linkedEntity: { report_id: reportData.report_id, patient_id: reportData.patient_id },
    actionLink: `/reports/${reportData.report_id}`,
    autoRemove: false
  })
}

export const notifyReportAmendmentRequest = (reportData, reason) => {
  return createNotification({
    type: NOTIFICATION_TYPES.REPORT_AMENDMENT_REQUEST,
    title: '✏️ Report Amendment Requested',
    message: `Amendment requested for report #${reportData.report_id}. Reason: ${reason}`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.ADMIN,
    linkedEntity: { report_id: reportData.report_id, patient_id: reportData.patient_id },
    actionLink: `/admin/amendments/${reportData.report_id}`,
    autoRemove: false
  })
}

/**
 * Patient Scheduling Notifications
 */
export const notifyAppointmentCreated = (appointmentData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
    title: '📅 New Appointment',
    message: `${appointmentData.exam_type} scheduled for ${appointmentData.patient_name} on ${appointmentData.appointment_date}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { appointment_id: appointmentData.appointment_id, patient_id: appointmentData.patient_id },
    actionLink: `/schedule/${appointmentData.appointment_id}`,
    autoRemove: false
  })
}

export const notifyAppointmentRescheduled = (appointmentData, oldDate) => {
  return createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED,
    title: '📅 Appointment Rescheduled',
    message: `${appointmentData.patient_name}'s appointment moved from ${oldDate} to ${appointmentData.appointment_date}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { appointment_id: appointmentData.appointment_id, patient_id: appointmentData.patient_id },
    actionLink: `/schedule/${appointmentData.appointment_id}`
  })
}

export const notifyAppointmentCancelled = (appointmentData, reason) => {
  return createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
    title: '❌ Appointment Cancelled',
    message: `${appointmentData.patient_name}'s appointment cancelled. Reason: ${reason}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { appointment_id: appointmentData.appointment_id, patient_id: appointmentData.patient_id },
    actionLink: `/schedule`
  })
}

export const notifySameDayReminder = (appointmentCount) => {
  return createNotification({
    type: NOTIFICATION_TYPES.SAME_DAY_REMINDER,
    title: '🗓️ Today\'s Appointments',
    message: `You have ${appointmentCount} imaging appointment(s) scheduled for today.`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    actionLink: `/schedule?date=today`,
    autoRemove: false
  })
}

export const notifyPatientCheckedIn = (appointmentData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.PATIENT_CHECKED_IN,
    title: '✅ Patient Check-in',
    message: `${appointmentData.patient_name} checked in for ${appointmentData.exam_type}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.RAD_TECH,
    linkedEntity: { appointment_id: appointmentData.appointment_id, patient_id: appointmentData.patient_id },
    actionLink: `/appointments/${appointmentData.appointment_id}`
  })
}

export const notifyPatientNoShow = (appointmentData) => {
  return createNotification({
    type: NOTIFICATION_TYPES.PATIENT_NO_SHOW,
    title: '⚠️ Patient No-Show',
    message: `${appointmentData.patient_name} did not show up for ${appointmentData.exam_type} appointment`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.SCHEDULING_STAFF,
    linkedEntity: { appointment_id: appointmentData.appointment_id, patient_id: appointmentData.patient_id },
    actionLink: `/schedule`,
    autoRemove: false
  })
}

/**
 * Secure Sharing & Access Notifications
 */
export const notifyFailedLoginAttempts = (accountDetails, attemptCount) => {
  return createNotification({
    type: NOTIFICATION_TYPES.FAILED_LOGIN_ATTEMPTS,
    title: '🔐 Failed Login Attempts',
    message: `${attemptCount} failed login attempts for account: ${accountDetails.email}. Check security.`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.ADMIN,
    linkedEntity: { account_id: accountDetails.account_id },
    actionLink: `/admin/security`,
    autoRemove: false
  })
}

export const notifyReportShared = (reportData, sharedByPhysician) => {
  return createNotification({
    type: NOTIFICATION_TYPES.REPORT_SHARED,
    title: '🔗 Report Shared',
    message: `${sharedByPhysician} shared report for ${reportData.patient_name} (Study #${reportData.study_id}) with you`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.REFERRING_PHYSICIAN,
    linkedEntity: { report_id: reportData.report_id, patient_id: reportData.patient_id },
    actionLink: `/reports/${reportData.report_id}`,
    autoRemove: false
  })
}

export const notifyUnusualAccess = (reportData, accessDetails) => {
  return createNotification({
    type: NOTIFICATION_TYPES.UNUSUAL_ACCESS,
    title: '🔔 Unusual Access Alert',
    message: `Report accessed outside normal hours from IP: ${accessDetails.ip_address}. User: ${accessDetails.user_email}`,
    priority: PRIORITY_LEVELS.URGENT,
    recipientRole: USER_ROLES.ADMIN,
    linkedEntity: { report_id: reportData.report_id },
    actionLink: `/admin/security-logs`,
    autoRemove: false
  })
}

export const notifyExternalLinkGenerated = (reportData, createdBy) => {
  return createNotification({
    type: NOTIFICATION_TYPES.EXTERNAL_LINK_GENERATED,
    title: '🔗 External Link Generated',
    message: `${createdBy} generated a new external sharing link for report #${reportData.report_id}`,
    priority: PRIORITY_LEVELS.ROUTINE,
    recipientRole: USER_ROLES.ADMIN,
    linkedEntity: { report_id: reportData.report_id },
    actionLink: `/admin/sharing-links`,
    autoRemove: false
  })
}
