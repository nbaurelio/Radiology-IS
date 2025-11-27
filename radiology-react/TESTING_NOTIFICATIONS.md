# Testing the Notification System

## Quick Start

### Access the Test Page

1. Start your development server (already running):
   ```
   npm run dev
   ```

2. Navigate to: **`http://localhost:3000/notifications-test`**

3. You'll see the Notification Test dashboard

## Test Dashboard Features

### Left Panel - Test Controls

**Feature Categories:**
- DICOM Upload & Management
- Third-Party Viewer & Reporting
- Telehealth Integration
- Report Generation
- Patient Scheduling
- Security & Access

**How to Use:**
1. Click a category tab (DICOM, Viewer, Telehealth, etc.)
2. Click any test button to trigger that specific notification
3. Watch notifications appear in the right panel
4. Click the notification bell icon in the header to see them there too

### Right Panel - Active Notifications

Shows all active notifications with:
- **Title**: What happened
- **Message**: Details
- **Priority**: Color-coded (Red=STAT, Orange=Urgent, Blue=Routine)
- **Type**: Internal notification type
- **Role**: Who receives it
- **Timestamp**: When it was triggered
- **Action Link**: Where it navigates to

### Quick Test Scenarios

Press these buttons to simulate realistic workflows:

**✅ Complete Study Workflow**
- Upload → Validate → Assign → Reading Started → Report Finalized
- Shows 5 notifications sequentially (1 second apart)

**✅ Complete Scheduling Workflow**
- Appointment Created → Today's Reminder → Patient Check-in
- Shows 3 notifications for scheduling flow

**❌ Error Scenarios**
- Upload Failed → SLA Warning → Viewer Error
- Tests urgent/critical notifications

**🔐 Security Alerts**
- Failed Login Attempts → Unusual Access → External Link Generated
- Tests security notifications

### Stats Bar

At the top shows:
- **Total Notifications**: Count of all active notifications
- **Unread**: Count of unread notifications
- **Mark All Read**: Button to mark all as read
- **Clear All**: Button to clear all notifications

## Testing Individual Notification Types

### Example 1: Test DICOM Upload
1. Click "DICOM" tab
2. Click "Study Uploaded"
3. Look for notification in right panel with:
   - Title: "🔴 STAT Study Uploaded"
   - Patient name and ID
   - CT Chest exam type

### Example 2: Test SLA Warning
1. Click "Viewer" tab
2. Click "SLA Warning"
3. See urgent priority (orange) notification

### Example 3: Test Telehealth
1. Click "Telehealth" tab
2. Click "Exam Request Received"
3. Check that it's targeting Scheduling Staff role

## What to Verify

### Notification Display ✓
- [ ] Notification appears in bell icon dropdown
- [ ] Badge shows unread count
- [ ] Notification card displays all details

### Functionality ✓
- [ ] Click notification to mark as read
- [ ] Unread indicator disappears after marking read
- [ ] Color coding matches priority level
- [ ] Timestamps show relative time ("just now", "5m ago")
- [ ] "Clear All" removes all notifications
- [ ] "Mark All Read" updates all statuses

### Styling ✓
- [ ] Light theme colors are correct
- [ ] Dark theme toggle works in header
- [ ] Priority borders are color-coded
- [ ] Unread notifications have different background
- [ ] Responsive layout on mobile

### Behavior ✓
- [ ] Multiple notifications stack properly
- [ ] Scrolling works for many notifications
- [ ] Click outside dropdown closes it
- [ ] Action links are preserved

## Browser Console Checks

Open DevTools (F12) and:

1. **Check for errors**: Should see none related to notifications
2. **Inspect notification object**: 
   ```javascript
   // In console
   const bell = document.querySelector('.notification-btn')
   bell.click() // Opens dropdown
   ```

3. **Verify context provides data**: Look for no context errors

## Testing Different Roles

The system supports these roles:
- **Radiologist**: Study uploaded, assigned, SLA warnings
- **Rad Tech**: Upload success/failed, study validated, reading started
- **Admin**: Viewer errors, API errors, security alerts
- **Scheduling Staff**: Appointments, exam requests, patient no-show
- **Referring Physician**: Report available, report shared
- **Front Desk**: (Scheduling staff features)

*Note: Currently test page shows all notifications regardless of role. In production, backend would filter by user role.*

## Advanced Testing

### Simulate Real-time Workflow

```javascript
// Paste in browser console
import { useNotifications } from '../contexts/NotificationContext'
import { notifyStudyUploaded, notifyStudyValidated } from '../services/notificationService'

// Create realistic sequence
setInterval(() => {
  addNotification(notifyStudyUploaded({...}))
}, 30000) // Every 30 seconds
```

### Test with Different Data

Click buttons multiple times to create:
- Different study IDs
- Multiple patients
- Repeated notifications

### Performance Testing

1. Click "Complete Study Workflow" 5-10 times rapidly
2. Check that 50+ notifications don't lag the UI
3. Verify scroll performance in notification list
4. Test "Clear All" with many notifications

## Troubleshooting

### Notifications Not Appearing

1. **Check NotificationProvider**: Make sure it's wrapped in App.jsx
2. **Check route**: Go to `http://localhost:3000/notifications-test`
3. **Check browser console**: Look for errors
4. **Check bell icon**: Try opening/closing dropdown

### Styling Issues

1. **Light theme colors off**: Check `index.css` variables
2. **Dropdown not visible**: Check z-index (should be 1000+)
3. **Text not readable**: Check color contrast

### Performance Issues

1. Many notifications slow? Check CSS animations
2. Check React DevTools Profiler
3. Verify useNotifications context not re-rendering unnecessarily

## Next Steps

Once testing is complete:

1. **Integrate into real features**: Use notification functions in actual upload, scheduling, etc.
2. **Add backend integration**: Connect to real API events
3. **Filter by role**: Backend sends only role-appropriate notifications
4. **Add persistence**: Store in database/localStorage
5. **Add real-time updates**: WebSocket for live notifications
6. **Email integration**: Send critical alerts via email

## Cleanup

When done testing:
- Delete `src/pages/NotificationTest.jsx`
- Remove import from `App.jsx`
- Remove route from `App.jsx`
- Keep `NotificationContext` and `notificationService` for production use

## Example Production Usage

```javascript
// In UploadDicom.jsx
import { useNotifications } from '../contexts/NotificationContext'
import { notifyUploadSuccess, notifyUploadFailed } from '../services/notificationService'

function UploadDicom() {
  const { addNotification } = useNotifications()

  const handleUpload = async (file) => {
    try {
      const response = await uploadToServer(file)
      
      // Show success notification
      addNotification(notifyUploadSuccess({
        study_id: response.id,
        patient_id: response.patientId,
        patient_name: response.patientName,
        modality: response.modality,
        exam_type: response.examType
      }))
    } catch (error) {
      // Show error notification
      addNotification(notifyUploadFailed({
        patient_id: file.patientId,
        patient_name: file.patientName
      }, error.message))
    }
  }

  return (
    <form onSubmit={handleUpload}>
      {/* Form fields */}
    </form>
  )
}
```
