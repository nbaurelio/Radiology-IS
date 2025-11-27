# Notification System Documentation

## Overview
The notification system is a comprehensive, role-based notification management solution for the Radiology Information System. It handles notifications across 6 key features with support for different user roles, priority levels, and notification types.

## Architecture

### Components

1. **NotificationContext** (`src/contexts/NotificationContext.jsx`)
   - Global state management for notifications
   - Provides hooks and methods to manage notifications
   - Auto-removes notifications based on `autoRemove` flag

2. **NotificationService** (`src/services/notificationService.js`)
   - Business logic for all notification types
   - Centralized notification creation functions
   - Role-based notification helpers

3. **Header Component** (Updated `src/components/Header.jsx`)
   - Displays notification bell icon with badge
   - Shows dropdown with notification list
   - Supports marking as read and clearing notifications

## Usage

### 1. Importing the Hook

```javascript
import { useNotifications } from '../contexts/NotificationContext'

function MyComponent() {
  const { addNotification, notifications, unreadCount } = useNotifications()
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
    </div>
  )
}
```

### 2. Adding a Notification

#### Simple Notification
```javascript
import { useNotifications } from '../contexts/NotificationContext'
import { 
  notifyStudyUploaded, 
  PRIORITY_LEVELS 
} from '../services/notificationService'

function UploadPage() {
  const { addNotification } = useNotifications()

  const handleUpload = async (studyData) => {
    try {
      // ... upload logic ...
      
      // Add notification
      const notification = notifyStudyUploaded({
        study_id: '12345',
        patient_id: 'P-10234',
        patient_name: 'Juan D.',
        exam_type: 'CT Chest',
        modality: 'CT',
        is_stat: true
      })
      
      addNotification(notification)
    } catch (error) {
      // Handle error
    }
  }

  return <button onClick={handleUpload}>Upload</button>
}
```

#### Custom Notification
```javascript
import { useNotifications } from '../contexts/NotificationContext'
import { createNotification, PRIORITY_LEVELS, USER_ROLES } from '../services/notificationService'

const { addNotification } = useNotifications()

const customNotif = createNotification({
  type: 'custom_type',
  title: 'Custom Title',
  message: 'Custom message content',
  priority: PRIORITY_LEVELS.URGENT,
  recipientRole: USER_ROLES.RADIOLOGIST,
  linkedEntity: { study_id: '12345', patient_id: 'P-10234' },
  actionLink: '/studies/12345',
  autoRemove: false
})

addNotification(customNotif)
```

## Available Notification Types

### Feature 1: DICOM Upload & Management
```javascript
import {
  notifyStudyUploaded,
  notifyStudyReassigned,
  notifyUploadSuccess,
  notifyUploadFailed,
  notifyStudyValidated
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyStudyUploaded()` → Radiologist
- `notifyStudyReassigned()` → Radiologist
- `notifyUploadSuccess()` → Rad Tech
- `notifyUploadFailed()` → Rad Tech
- `notifyStudyValidated()` → Rad Tech

### Feature 2: Third-Party Viewer & Reporting
```javascript
import {
  notifyStudyAssigned,
  notifyStudySLAWarning,
  notifyReadingStarted,
  notifyReportFinalized,
  notifyViewerError
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyStudyAssigned()` → Radiologist
- `notifyStudySLAWarning()` → Radiologist
- `notifyReadingStarted()` → Rad Tech
- `notifyReportFinalized()` → Rad Tech
- `notifyViewerError()` → Admin

### Feature 3: Telehealth Integration
```javascript
import {
  notifyExamRequestReceived,
  notifyExamRequestUpdated,
  notifyTelehealthStudy,
  notifyTelehealthAPIError
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyExamRequestReceived()` → Scheduling Staff
- `notifyExamRequestUpdated()` → Scheduling Staff
- `notifyTelehealthStudy()` → Radiologist
- `notifyTelehealthAPIError()` → Admin

### Feature 4: Report Generation
```javascript
import {
  notifyIncompleteReportsReminder,
  notifyReportAvailable,
  notifyReportAmendmentRequest
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyIncompleteReportsReminder()` → Radiologist
- `notifyReportAvailable()` → Referring Physician
- `notifyReportAmendmentRequest()` → Admin

### Feature 5: Patient Scheduling
```javascript
import {
  notifyAppointmentCreated,
  notifyAppointmentRescheduled,
  notifyAppointmentCancelled,
  notifySameDayReminder,
  notifyPatientCheckedIn,
  notifyPatientNoShow
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyAppointmentCreated()` → Scheduling Staff
- `notifyAppointmentRescheduled()` → Scheduling Staff
- `notifyAppointmentCancelled()` → Scheduling Staff
- `notifySameDayReminder()` → Scheduling Staff
- `notifyPatientCheckedIn()` → Rad Tech
- `notifyPatientNoShow()` → Scheduling Staff

### Feature 6: Secure Sharing & Access
```javascript
import {
  notifyFailedLoginAttempts,
  notifyReportShared,
  notifyUnusualAccess,
  notifyExternalLinkGenerated
} from '../services/notificationService'
```

**Recipients by function:**
- `notifyFailedLoginAttempts()` → Admin
- `notifyReportShared()` → Referring Physician
- `notifyUnusualAccess()` → Admin
- `notifyExternalLinkGenerated()` → Admin

## Notification Structure

Each notification contains:

```javascript
{
  id: 1704067200000,              // Unique ID (timestamp-based)
  type: 'study_uploaded',         // Notification type
  title: '🔴 STAT Study Uploaded', // Display title with emoji
  message: 'CT Chest - Patient: Juan D. (ID: P-10234)', // Detailed message
  priority: 'stat',               // 'stat', 'urgent', 'routine'
  recipientRole: 'radiologist',   // Target role
  linkedEntity: {                 // Related data
    study_id: '12345',
    patient_id: 'P-10234'
  },
  actionLink: '/studies/12345',   // Where clicking takes user
  status: 'unread',               // 'unread', 'read', 'archived'
  timestamp: Date object,         // Creation time
  autoRemove: false               // Auto-dismiss after 5 seconds
}
```

## Priority Levels

```javascript
PRIORITY_LEVELS = {
  ROUTINE: 'routine',   // Blue - standard operations
  URGENT: 'urgent',     // Amber - requires attention
  STAT: 'stat'          // Red - immediate attention
}
```

**Visual Indication:** Color-coded left border on notification items

## User Roles

```javascript
USER_ROLES = {
  RADIOLOGIST: 'radiologist',
  RAD_TECH: 'rad_tech',
  REFERRING_PHYSICIAN: 'referring_physician',
  ADMIN: 'admin',
  SCHEDULING_STAFF: 'scheduling_staff',
  FRONT_DESK: 'front_desk'
}
```

## Context Methods

### `addNotification(notification)`
Adds a new notification and returns its ID.

```javascript
const notificationId = addNotification(notification)
```

### `removeNotification(id)`
Removes a specific notification.

```javascript
removeNotification(notificationId)
```

### `markAsRead(id)`
Marks a notification as read.

```javascript
markAsRead(notificationId)
```

### `markAllAsRead()`
Marks all notifications as read.

```javascript
markAllAsRead()
```

### `archiveNotification(id)`
Archives a notification (hides from list).

```javascript
archiveNotification(notificationId)
```

### `clearAll()`
Removes all notifications.

```javascript
clearAll()
```

### `unreadCount`
Getter for the count of unread notifications.

```javascript
const count = unreadCount  // Returns number
```

### `notifications`
Getter for all active (non-archived) notifications.

```javascript
const notifs = notifications  // Returns array
```

## Integration Examples

### Example 1: DICOM Upload Success
```javascript
import { useNotifications } from '../contexts/NotificationContext'
import { notifyUploadSuccess } from '../services/notificationService'

function UploadDicom() {
  const { addNotification } = useNotifications()

  const handleUploadComplete = (studyData) => {
    // Upload logic...
    
    const notification = notifyUploadSuccess({
      study_id: studyData.id,
      patient_id: studyData.patientId,
      patient_name: studyData.patientName,
      modality: 'CT',
      exam_type: 'Chest'
    })
    
    addNotification(notification)
  }

  return <div>Upload Component</div>
}
```

### Example 2: SLA Warning Notification
```javascript
// In a background service or scheduled task
import { notifyStudySLAWarning } from '../services/notificationService'

export function checkStudySLAs() {
  const { addNotification } = useNotifications()
  
  const overdueStudies = getOverdueStudies(hoursThreshold = 4)
  
  overdueStudies.forEach(study => {
    const notification = notifyStudySLAWarning(study, 4)
    addNotification(notification)
  })
}
```

### Example 3: Role-based Notification
```javascript
// Only notify specific roles based on user
import { USER_ROLES } from '../services/notificationService'

function SmartNotification(notificationType, data) {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  
  let notification = null
  
  switch(user.userType) {
    case USER_ROLES.RADIOLOGIST:
      notification = notifyStudyUploaded(data)
      break
    case USER_ROLES.RAD_TECH:
      notification = notifyStudyValidated(data)
      break
    // ... more cases
  }
  
  if (notification) {
    addNotification(notification)
  }
}
```

## Best Practices

1. **Use Pre-built Functions**: Always use the provided notification functions from `notificationService.js` for consistency.

2. **Set `autoRemove` appropriately**:
   - `true` (default) for informational messages
   - `false` for critical alerts that need user attention

3. **Link Entities**: Always populate `linkedEntity` with relevant IDs for audit trails and tracking.

4. **Action Links**: Provide `actionLink` to allow users to navigate directly to the related resource.

5. **Error Handling**: Always add notifications on operation completion (success/failure).

6. **Role Filtering**: Backend should filter notifications per user role before sending.

7. **Timestamps**: Always use `new Date()` or server timestamp for consistency.

## Future Enhancements

1. **Persistence**: Store notifications in database or localStorage
2. **Filtering**: Add filters by type, priority, date range
3. **Email Integration**: Send email notifications for critical alerts
4. **Sound Alerts**: Add audio notification for STAT/Urgent items
5. **Notification History**: Archive and review past notifications
6. **Real-time Updates**: Integrate with WebSockets for live notifications
7. **Batch Processing**: Group similar notifications together
8. **Search**: Add search functionality in notification panel
