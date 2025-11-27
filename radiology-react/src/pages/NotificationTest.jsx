import React, { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import {
  // DICOM Upload & Management
  notifyStudyUploaded,
  notifyStudyReassigned,
  notifyUploadSuccess,
  notifyUploadFailed,
  notifyStudyValidated,
  
  // Third-Party Viewer & Reporting
  notifyStudyAssigned,
  notifyStudySLAWarning,
  notifyReadingStarted,
  notifyReportFinalized,
  notifyViewerError,
  
  // Telehealth Integration
  notifyExamRequestReceived,
  notifyExamRequestUpdated,
  notifyTelehealthStudy,
  notifyTelehealthAPIError,
  
  // Report Generation
  notifyIncompleteReportsReminder,
  notifyReportAvailable,
  notifyReportAmendmentRequest,
  
  // Patient Scheduling
  notifyAppointmentCreated,
  notifyAppointmentRescheduled,
  notifyAppointmentCancelled,
  notifySameDayReminder,
  notifyPatientCheckedIn,
  notifyPatientNoShow,
  
  // Secure Sharing & Access
  notifyFailedLoginAttempts,
  notifyReportShared,
  notifyUnusualAccess,
  notifyExternalLinkGenerated,
  
  PRIORITY_LEVELS,
  USER_ROLES
} from '../services/notificationService'

const NotificationTest = () => {
  const { addNotification, notifications, unreadCount, clearAll, markAllAsRead } = useNotifications()
  const [selectedCategory, setSelectedCategory] = useState('dicom')

  // Sample data generators
  const sampleStudy = {
    study_id: '12345',
    patient_id: 'P-10234',
    patient_name: 'Juan D.',
    exam_type: 'CT Chest',
    modality: 'CT',
    is_stat: true,
    report_id: 'R-5678'
  }

  const sampleAppointment = {
    appointment_id: 'A-999',
    patient_id: 'P-10234',
    patient_name: 'Juan D.',
    exam_type: 'CT Chest',
    appointment_date: new Date(Date.now() + 86400000).toLocaleDateString()
  }

  const sampleExam = {
    exam_id: 'E-111',
    patient_id: 'P-10234',
    patient_name: 'Juan D.',
    exam_type: 'MRI Brain',
    referring_physician: 'Dr. Smith',
    is_urgent: false,
    new_date: new Date(Date.now() + 172800000).toLocaleDateString()
  }

  const sampleReport = {
    report_id: 'R-5678',
    patient_id: 'P-10234',
    patient_name: 'Juan D.',
    study_id: '12345'
  }

  const sampleAccount = {
    account_id: 'ACC-123',
    email: 'patient@example.com'
  }

  // DICOM Upload & Management Tests
  const testDICOMNotifications = {
    studyUploaded: () => {
      const notif = notifyStudyUploaded(sampleStudy)
      addNotification(notif)
    },
    studyReassigned: () => {
      const notif = notifyStudyReassigned(sampleStudy, 'Dr. Anderson', 'Dr. Smith')
      addNotification(notif)
    },
    uploadSuccess: () => {
      const notif = notifyUploadSuccess(sampleStudy)
      addNotification(notif)
    },
    uploadFailed: () => {
      const notif = notifyUploadFailed(sampleStudy, 'Invalid DICOM format or corrupted file')
      addNotification(notif)
    },
    studyValidated: () => {
      const notif = notifyStudyValidated(sampleStudy)
      addNotification(notif)
    }
  }

  // Third-Party Viewer & Reporting Tests
  const testViewerNotifications = {
    studyAssigned: () => {
      const notif = notifyStudyAssigned(sampleStudy, 'Dr. Anderson')
      addNotification(notif)
    },
    slaWarning: () => {
      const notif = notifyStudySLAWarning(sampleStudy, 5)
      addNotification(notif)
    },
    readingStarted: () => {
      const notif = notifyReadingStarted(sampleStudy, 'Dr. Smith')
      addNotification(notif)
    },
    reportFinalized: () => {
      const notif = notifyReportFinalized(sampleStudy, 'Dr. Smith')
      addNotification(notif)
    },
    viewerError: () => {
      const notif = notifyViewerError(sampleStudy, 'Failed to load WADO server')
      addNotification(notif)
    }
  }

  // Telehealth Integration Tests
  const testTelehealthNotifications = {
    examRequestReceived: () => {
      const notif = notifyExamRequestReceived(sampleExam)
      addNotification(notif)
    },
    examRequestUpdated: () => {
      const notif = notifyExamRequestUpdated(sampleExam, 'rescheduled')
      addNotification(notif)
    },
    telehealthStudy: () => {
      const notif = notifyTelehealthStudy(sampleStudy)
      addNotification(notif)
    },
    telehealthAPIError: () => {
      const notif = notifyTelehealthAPIError('Connection timeout to telehealth provider')
      addNotification(notif)
    }
  }

  // Report Generation Tests
  const testReportNotifications = {
    incompleteReminder: () => {
      const notif = notifyIncompleteReportsReminder(3)
      addNotification(notif)
    },
    reportAvailable: () => {
      const notif = notifyReportAvailable(sampleReport)
      addNotification(notif)
    },
    amendmentRequest: () => {
      const notif = notifyReportAmendmentRequest(sampleReport, 'Incorrect patient identifier')
      addNotification(notif)
    }
  }

  // Scheduling Tests
  const testSchedulingNotifications = {
    appointmentCreated: () => {
      const notif = notifyAppointmentCreated(sampleAppointment)
      addNotification(notif)
    },
    appointmentRescheduled: () => {
      const notif = notifyAppointmentRescheduled(
        sampleAppointment,
        new Date().toLocaleDateString()
      )
      addNotification(notif)
    },
    appointmentCancelled: () => {
      const notif = notifyAppointmentCancelled(sampleAppointment, 'Patient request')
      addNotification(notif)
    },
    sameDayReminder: () => {
      const notif = notifySameDayReminder(5)
      addNotification(notif)
    },
    patientCheckedIn: () => {
      const notif = notifyPatientCheckedIn(sampleAppointment)
      addNotification(notif)
    },
    patientNoShow: () => {
      const notif = notifyPatientNoShow(sampleAppointment)
      addNotification(notif)
    }
  }

  // Security & Access Tests
  const testSecurityNotifications = {
    failedLoginAttempts: () => {
      const notif = notifyFailedLoginAttempts(sampleAccount, 5)
      addNotification(notif)
    },
    reportShared: () => {
      const notif = notifyReportShared(sampleReport, 'Dr. Anderson')
      addNotification(notif)
    },
    unusualAccess: () => {
      const notif = notifyUnusualAccess(sampleReport, {
        ip_address: '192.168.1.100',
        user_email: 'admin@example.com'
      })
      addNotification(notif)
    },
    externalLinkGenerated: () => {
      const notif = notifyExternalLinkGenerated(sampleReport, 'Dr. Smith')
      addNotification(notif)
    }
  }

  const allNotifications = {
    dicom: testDICOMNotifications,
    viewer: testViewerNotifications,
    telehealth: testTelehealthNotifications,
    report: testReportNotifications,
    scheduling: testSchedulingNotifications,
    security: testSecurityNotifications
  }

  const categoryLabels = {
    dicom: 'DICOM Upload & Management',
    viewer: 'Third-Party Viewer & Reporting',
    telehealth: 'Telehealth Integration',
    report: 'Report Generation',
    scheduling: 'Patient Scheduling',
    security: 'Security & Access'
  }

  const renderNotificationButtons = (category) => {
    const notifs = allNotifications[category]
    return Object.entries(notifs).map(([key, func]) => (
      <button
        key={key}
        onClick={func}
        className="test-btn"
      >
        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </button>
    ))
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🔔 Notification System Test</h1>
        <div style={styles.statsBar}>
          <span style={styles.stat}>Total Notifications: {notifications.length}</span>
          <span style={styles.stat}>Unread: {unreadCount}</span>
          <button onClick={markAllAsRead} style={styles.actionBtn}>
            Mark All Read
          </button>
          <button 
            onClick={() => {
              clearAll()
              setShowNotifications(false)
            }} 
            style={{...styles.actionBtn, background: '#ef4444'}}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Test Controls */}
        <div style={styles.testPanel}>
          <h2>Test Notifications by Feature</h2>

          <div style={styles.categoryTabs}>
            {Object.keys(allNotifications).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.tab,
                  background: selectedCategory === cat ? '#6d5dfc' : '#f0f1f5',
                  color: selectedCategory === cat ? 'white' : '#0f172a'
                }}
              >
                {categoryLabels[cat].split(' ')[0]}
              </button>
            ))}
          </div>

          <div style={styles.buttonGroup}>
            <h3>{categoryLabels[selectedCategory]}</h3>
            <div style={styles.buttonsContainer}>
              {renderNotificationButtons(selectedCategory)}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={styles.quickActions}>
            <h3>Quick Test Scenarios</h3>
            <button
              onClick={() => {
                // Simulate a workflow
                addNotification(notifyStudyUploaded(sampleStudy))
                setTimeout(() => addNotification(notifyStudyValidated(sampleStudy)), 1000)
                setTimeout(() => addNotification(notifyStudyAssigned(sampleStudy, 'Dr. Anderson')), 2000)
                setTimeout(() => addNotification(notifyReadingStarted(sampleStudy, 'Dr. Anderson')), 3000)
                setTimeout(() => addNotification(notifyReportFinalized(sampleStudy, 'Dr. Anderson')), 4000)
              }}
              style={{...styles.quickBtn, background: '#10b981'}}
            >
              Complete Study Workflow
            </button>

            <button
              onClick={() => {
                // Simulate scheduling
                addNotification(notifyAppointmentCreated(sampleAppointment))
                setTimeout(() => addNotification(notifySameDayReminder(1)), 500)
                setTimeout(() => addNotification(notifyPatientCheckedIn(sampleAppointment)), 1000)
              }}
              style={{...styles.quickBtn, background: '#3b82f6'}}
            >
              Complete Scheduling Workflow
            </button>

            <button
              onClick={() => {
                // Simulate errors
                addNotification(notifyUploadFailed(sampleStudy, 'File corrupted'))
                setTimeout(() => addNotification(notifyStudySLAWarning(sampleStudy, 6)), 500)
                setTimeout(() => addNotification(notifyViewerError(sampleStudy, 'Connection failed')), 1000)
              }}
              style={{...styles.quickBtn, background: '#ef4444'}}
            >
              Error Scenarios
            </button>

            <button
              onClick={() => {
                // Simulate security alerts
                addNotification(notifyFailedLoginAttempts(sampleAccount, 5))
                setTimeout(() => addNotification(notifyUnusualAccess(sampleReport, {ip_address: '192.168.1.100', user_email: 'admin@example.com'})), 500)
                setTimeout(() => addNotification(notifyExternalLinkGenerated(sampleReport, 'Dr. Smith')), 1000)
              }}
              style={{...styles.quickBtn, background: '#f59e0b'}}
            >
              Security Alerts
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={styles.notificationPanel}>
          <h2>Active Notifications ({notifications.length})</h2>
          <div style={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No active notifications</p>
                <small>Trigger notifications from the left panel</small>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    ...styles.notificationCard,
                    borderLeftColor: getPriorityColor(notif.priority),
                    background: notif.status === 'unread' ? '#edeaff' : '#f0f1f5'
                  }}
                >
                  <div style={styles.notifHeader}>
                    <h4 style={styles.notifTitle}>{notif.title}</h4>
                    <span style={{...styles.priority, background: getPriorityColor(notif.priority)}}>
                      {notif.priority.toUpperCase()}
                    </span>
                  </div>
                  <p style={styles.notifMessage}>{notif.message}</p>
                  <div style={styles.notifFooter}>
                    <small style={styles.notifMeta}>
                      Type: <strong>{notif.type}</strong> | Role: <strong>{notif.recipientRole}</strong>
                    </small>
                    <small style={styles.notifTime}>
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                  {notif.actionLink && (
                    <small style={styles.actionLink}>
                      Link: {notif.actionLink}
                    </small>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const getPriorityColor = (priority) => {
  const colors = {
    stat: '#ef4444',
    urgent: '#f59e0b',
    routine: '#3b82f6'
  }
  return colors[priority] || colors.routine
}

const styles = {
  container: {
    padding: '20px',
    background: '#f0f1f5',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px'
  },
  statsBar: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  stat: {
    background: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e1e6',
    fontSize: '14px',
    fontWeight: '500'
  },
  actionBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#6d5dfc',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    maxWidth: '1400px'
  },
  testPanel: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e1e6'
  },
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  buttonGroup: {
    marginBottom: '25px'
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  testBtn: {
    padding: '10px 12px',
    border: '1px solid #e0e1e6',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    textAlign: 'left',
    '&:hover': {
      background: '#f0f1f5'
    }
  },
  quickActions: {
    borderTop: '1px solid #e0e1e6',
    paddingTop: '20px'
  },
  quickBtn: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    transition: 'all 0.2s'
  },
  notificationPanel: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e1e6',
    maxHeight: '800px',
    display: 'flex',
    flexDirection: 'column'
  },
  notificationsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280'
  },
  notificationCard: {
    borderLeft: '3px solid',
    padding: '12px',
    background: '#edeaff',
    borderRadius: '8px',
    fontSize: '13px'
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '8px'
  },
  notifTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a'
  },
  priority: {
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    fontWeight: '600'
  },
  notifMessage: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#0f172a',
    lineHeight: '1.4'
  },
  notifFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    paddingTop: '8px'
  },
  notifMeta: {
    color: '#6b7280'
  },
  notifTime: {
    color: '#6b7280'
  },
  actionLink: {
    display: 'block',
    marginTop: '6px',
    color: '#6d5dfc',
    wordBreak: 'break-all'
  }
}

export default NotificationTest
