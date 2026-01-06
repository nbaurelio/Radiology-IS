# Software Requirements Specification
## Radiology Information System

---

## 1. System Overview

A web-based radiology information system for managing patient records, medical imaging studies, and diagnostic reports.

**Technology Stack:**
- Frontend: React + Vite
- Backend: Supabase (PostgreSQL + Authentication)
- DICOM Viewer: Cornerstone.js
- Email: EmailJS

---

## 2. User Roles

| Role | Permissions |
|------|-------------|
| **Administrator** | Full system access, user management, system configuration |
| **Radiologist** | View studies, create/edit reports, view patient records |
| **Rad Tech** | Schedule studies, upload DICOM files, manage patients |

---

## 3. Functional Requirements

### 3.1 User Authentication
- Login with email or user ID
- Password-based authentication
- Role-based access control
- Session management

### 3.2 Patient Management
- Add new patients
- Edit patient information
- View patient records
- Search patients by name or ID
- Track patient appointments

### 3.3 Study Management
- Schedule new studies
- Upload DICOM files
- View study details
- Track study status (pending, completed, finalized)
- Assign studies to radiologists
- Set study priority (routine, urgent, STAT)

### 3.4 DICOM Image Viewing
- View medical images
- Zoom and pan controls
- Window/level adjustments
- Multi-image navigation
- Measurement tools

### 3.5 Report Management
- Create diagnostic reports
- Edit existing reports
- Finalize reports
- Link reports to studies
- Generate PDF reports
- Search reports

### 3.6 Dashboard
- View recent studies
- Filter by status and priority
- Display system statistics
- Quick access to pending tasks

### 3.7 Notifications
- Real-time system notifications
- Study assignment alerts
- Report completion notifications
- Priority-based notifications

### 3.8 User Management (Admin Only)
- Create new user accounts
- Assign user roles
- Send account credentials via email
- Manage user permissions

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 3 seconds
- DICOM image load time < 5 seconds
- Support 50+ concurrent users

### 4.2 Security
- Encrypted data transmission (HTTPS)
- Row-level security on database
- Secure password storage
- Session timeout after inactivity

### 4.3 Usability
- Responsive design (desktop and tablet)
- Intuitive navigation
- Consistent UI across pages
- Accessibility standards

### 4.4 Reliability
- 99% uptime
- Automatic database backups
- Error logging and monitoring

### 4.5 Compatibility
- Modern browsers (Chrome, Firefox, Edge)
- Desktop and tablet devices
- Internet connection required

---

## 5. System Requirements

### 5.1 Client Requirements
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+
- **RAM**: 4 GB minimum
- **Internet**: Broadband connection
- **Screen**: 1280x720 minimum resolution

### 5.2 Server Requirements
- **Node.js**: v18 or higher
- **Database**: PostgreSQL (via Supabase)
- **Storage**: 2 GB minimum

---

## 6. Database Schema

### 6.1 Main Tables

**users**
- User authentication and profile information
- Links to Supabase Auth

**patients**
- Patient demographic data
- Medical record numbers
- Contact information

**studies**
- Radiology exam records
- DICOM file storage
- Study status and priority
- Links to patients

**reports**
- Diagnostic reports
- Report content and findings
- Links to studies
- Report status

---

## 7. Key Features

### 7.1 Study Workflow
1. Rad Tech schedules study
2. DICOM files uploaded
3. Study assigned to radiologist
4. Radiologist views images and creates report
5. Report finalized and available

### 7.2 Report Workflow
1. Select completed study
2. Enter report findings
3. Add impressions and recommendations
4. Finalize report
5. Generate PDF

### 7.3 Patient Workflow
1. Register new patient
2. Schedule appointment
3. Track study progress
4. View completed reports

---

## 8. Data Flow

```
Patient Registration → Study Scheduling → DICOM Upload → 
Image Viewing → Report Creation → Report Finalization → PDF Generation
```

---

## 9. Security Requirements

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security policies
- **Password Policy**: Minimum 6 characters
- **Session Management**: Auto-logout after 24 hours

---

## 10. Integration Requirements

### 10.1 External Services
- **Supabase**: Database and authentication
- **EmailJS**: Email notifications
- **Vercel**: Hosting and deployment

### 10.2 File Formats
- **DICOM**: Medical imaging standard
- **PDF**: Report generation
- **JSON**: Data exchange

---

## 11. Constraints and Assumptions

### 11.1 Constraints
- Internet connection required
- DICOM files must be valid format
- Maximum file size: 50 MB per DICOM file

### 11.2 Assumptions
- Users have basic computer skills
- Stable internet connection available
- Modern web browser installed

---

## 12. Future Enhancements

- Mobile application
- Advanced image analysis tools
- Integration with PACS systems
- Multi-language support
- Automated report templates
- Voice dictation for reports

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Active
