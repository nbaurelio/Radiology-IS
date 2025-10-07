# Reports Debugging Guide

## Issue
Reports not showing up in the Radiology Reports table after creation.

## Debugging Steps Added

I've added console logging throughout the reports system to help identify the issue.

### 1. Open Browser Console
1. Navigate to Reports page
2. Press `F12` to open Developer Tools
3. Click on the **Console** tab

### 2. Check What Happens on Page Load

When the page loads, you should see:
```
Loading reports...
getAllReports data: [array of appointments]
Reports result: {success: true, reports: [...]}
Displaying reports: [array]
```

**If you see an error**, note what it says. Common issues:
- Foreign key relationship errors
- RLS (Row Level Security) policy errors
- Missing columns

### 3. Try Creating a Report

1. Click the **+** button
2. Fill in the form:
   - Select a patient
   - Choose a date/time
   - Select exam type
   - Select status
3. Click **Create Appointment**

**Watch the console for:**
```
Creating report with data: {patient_id: "...", appointment_date: "...", ...}
Create report result: {success: true, report: {...}}
Reloading reports...
Loading reports...
getAllReports data: [array with new appointment]
```

### 4. Common Issues & Solutions

#### Issue: "Foreign key constraint violation"
**Cause**: The patient_id doesn't exist or is incorrect  
**Solution**: Make sure you're selecting a patient from the dropdown

#### Issue: "RLS policy violation" or "permission denied"
**Cause**: Row Level Security policies not allowing insert/select  
**Solution**: Check Supabase RLS policies for `appointments` table

#### Issue: "appointments table does not exist"
**Cause**: The appointments table might not be created yet  
**Solution**: Create the appointments table in Supabase

#### Issue: "Could not find foreign key relationship"
**Cause**: The join in the query can't find the relationship  
**Solution**: Check that foreign keys exist between:
- `appointments.patient_id` → `patients.id`
- `studies.appointment_id` → `appointments.id`

#### Issue: Reports show "No reports found" but console shows data
**Cause**: The data structure doesn't match what the display function expects  
**Solution**: Check console log for data structure, adjust `displayReports()` function

### 5. Manual Database Check

If the console shows success but no data appears:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Open **appointments** table
4. Check if your new appointment was created
5. Note the structure of the data

### 6. Quick Fix: Simplified Query

If the joins are causing issues, you can temporarily simplify the query:

In `supabase-config.js`, change `getAllReports()` to:

```javascript
async getAllReports(limit = 50) {
    try {
        // Simple query without joins first
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('appointment_date', { ascending: false })
            .limit(limit);

        if (error) throw error;
        
        // Then manually fetch patient data
        if (data && data.length > 0) {
            for (let appointment of data) {
                const { data: patient } = await supabase
                    .from('patients')
                    .select('id, patient_id, first_name, last_name')
                    .eq('id', appointment.patient_id)
                    .single();
                
                appointment.patients = patient;
            }
        }
        
        return { success: true, reports: data || [] };
    } catch (error) {
        console.error('Get reports error:', error);
        return { success: false, message: error.message, reports: [] };
    }
}
```

### 7. Check Table Structure

Make sure your `appointments` table has these columns:
- `id` (uuid, primary key)
- `patient_id` (uuid, foreign key to patients.id)
- `appointment_date` (timestamp with time zone)
- `exam_type` (text)
- `status` (text)
- `notes` (text, nullable)
- `created_at` (timestamp with time zone)

### 8. Check RLS Policies

In Supabase, check that the `appointments` table has policies for:
- **SELECT**: Allow authenticated users to read
- **INSERT**: Allow authenticated users to create

Example policies:
```sql
-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all appointments
CREATE POLICY "Allow authenticated users to read appointments"
ON appointments FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create appointments
CREATE POLICY "Allow authenticated users to create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (true);
```

## Next Steps

1. **Refresh the page** with console open
2. **Note any errors** in the console
3. **Try creating a report** and watch the console logs
4. **Share the console output** if you need help debugging

The console logs will tell us exactly where the issue is occurring.
