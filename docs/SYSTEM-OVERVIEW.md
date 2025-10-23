# XferDx - System Overview

## 📊 Database Tables

### **patients**
Patient demographic information
- `id`, `patient_id`, `first_name`, `last_name`, `date_of_birth`, `sex`, `phone`, `email`, `address`, `mrn`, `medical_history`, `notes`

### **reports**
Radiology reports (main data source for Reports page)
- `id`, `study_id`, `patient_id`, `name`, `exam_type`, `study_date`, `schedule`, `modality`, `priority`, `status`, `report_status`, `assigned_radiologist`, `notes`, `dicom_file_url`, `created_at`, `updated_at`

### **studies**
Study records (optional, linked to reports)
- `id`, `study_id`, `patient_id`, `exam_type`, `modality`, `priority`, `status`, `study_date`

### **appointments**
Appointment scheduling (separate from reports)
- `id`, `patient_id`, `appointment_date`, `exam_type`, `status`, `notes`

---

## 🔄 System Flow

### **Reports System**
1. **Reports Page** (`reports.html`) → Displays all reports from `reports` table
2. **Add Report** (`add-report.html`) → Creates new report in `reports` table
3. **Report Detail** (`report-detail.html`) → Shows full report details, allows editing

### **Patient System**
1. **Patients Page** → Lists all patients
2. **Patient Detail** → Shows patient info, appointments (from `reports` table), and studies
3. **Add Patient** → Creates new patient record

---

## 📋 Key Features

### **Reports Page**
- Displays: Study ID, Patient, Exam Type, Date, Priority, Status, Notes
- Clicking row → Goes to report detail page
- Search functionality
- Add new report via + button

### **Report Detail Page**
- Report Information (Study ID, Exam Type, Modality, Priority, Status, Radiologist)
- Patient Information (Name, Patient ID, link to patient detail)
- Study Details (Dates, timestamps)
- Report Findings & Notes
- Edit functionality

### **Patient Detail Page**
- Patient demographics
- **Appointments section** → Shows reports from `reports` table (not appointments table)
- Studies History
- Edit patient info

---

## 🎯 Important Notes

### **Reports vs Appointments**
- **Reports table** = Radiology reports with findings, used in Reports page
- **Appointments table** = Scheduling only, separate system
- Patient detail "Appointments" section shows **reports**, not appointments

### **Data Relationships**
- Reports → Patients (via `patient_id`)
- Studies → Patients (via `patient_id`)
- Patient detail fetches reports to display in appointments section

### **Status Values**
- **Report Status**: pending, reading, completed
- **Priority**: routine, urgent, stat

---

## 🚀 Quick Reference

### **Create Report**
1. Reports page → Click +
2. Select patient, fill Study ID, date, exam type, modality, priority, status
3. Submit → Creates report in `reports` table

### **View Report**
1. Reports page → Click any row
2. Shows full report details
3. Can edit report information

### **View Patient Reports**
1. Patient detail page → Appointments section
2. Shows all reports for that patient
3. Status reflects actual report status

---

## 📁 File Structure

```
main/
├── Reports/
│   ├── reports.html          # Reports list
│   ├── add-report.html       # Create new report
│   ├── report-detail.html    # View/edit report
│   └── reports.css
├── Patients/
│   ├── patients.html         # Patients list
│   ├── patient-detail.html   # Patient info + reports
│   ├── add-patient.html      # Create patient
│   └── patients.css
└── shared/
    ├── supabase-config.js    # Database services
    ├── common.css
    └── header.js
```

---

## ✅ System Status

**Working:**
- ✅ Reports CRUD (Create, Read, Update)
- ✅ Patient CRUD
- ✅ Report-Patient linking
- ✅ Priority badges
- ✅ Status tracking
- ✅ Search functionality

**To Implement:**
- DICOM file upload/viewing
- Radiologist assignment from users table
- Report approval workflow
- Notifications
