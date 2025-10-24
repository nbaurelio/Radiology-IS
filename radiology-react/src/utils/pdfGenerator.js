import { jsPDF } from 'jspdf'
import logo from '../assets/xferdx-logo.png'

export const generateReportPDF = async (reportData, formData) => {
  const doc = new jsPDF()
  
  // Helper function to add logo
  const addLogo = () => {
    // Add logo with proper 1:1 aspect ratio (square, not compressed)
    doc.addImage(logo, 'PNG', 15, 10, 20, 20)
    
    // Add XferDx text beside logo
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('XferDx', 38, 22)
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day}-${year} ${hours}:${minutes}`
  }

  // Calculate age
  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age-- 
    }
    return age
  }

  // Add logo
  addLogo()

  // Header - Clinic Information (Right side)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  // Split address into lines
  const addressLines = formData.clinicAddress.split('\n')
  let yPos = 12
  
  addressLines.forEach(line => {
    const textWidth = doc.getTextWidth(line)
    doc.text(line, 210 - textWidth - 15, yPos)
    yPos += 4
  })
  
  doc.text(`Mobile No: ${formData.clinicMobile}`, 210 - doc.getTextWidth(`Mobile No: ${formData.clinicMobile}`) - 15, yPos)
  yPos += 4
  doc.text(formData.clinicEmail, 210 - doc.getTextWidth(formData.clinicEmail) - 15, yPos)

  // Patient Information (Left side)
  yPos = 40
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const patientName = reportData.patients ? 
    `${reportData.patients.first_name} ${reportData.patients.last_name}` : 
    reportData.name || 'Unknown Patient'
  
  const age = reportData.patients?.date_of_birth ? calculateAge(reportData.patients.date_of_birth) : 'N/A'
  const gender = reportData.patients?.sex ? reportData.patients.sex.charAt(0).toUpperCase() : 'N/A'
  
  doc.text(`Patient Name: ${patientName}`, 15, yPos)
  yPos += 5
  doc.text(`Age: ${age}Y${gender !== 'N/A' ? 'M' : ''}    Gender: ${gender}`, 15, yPos)
  yPos += 5
  doc.text(`Doctor Name: ${reportData.assigned_radiologist || 'N/A'}`, 15, yPos)

  // File Information (Right side)
  yPos = 40
  const fileNo = `X-RAY File No.: ${reportData.study_id || 'N/A'}`
  doc.text(fileNo, 210 - doc.getTextWidth(fileNo) - 15, yPos)
  yPos += 5
  
  const requestDate = `Request Date: ${formatDate(reportData.study_date || reportData.created_at)}`
  doc.text(requestDate, 210 - doc.getTextWidth(requestDate) - 15, yPos)
  yPos += 5
  
  const releaseDate = `Release Date: ${formatDate(reportData.updated_at)}`
  doc.text(releaseDate, 210 - doc.getTextWidth(releaseDate) - 15, yPos)

  // Horizontal line
  doc.line(15, 58, 195, 58)

  // RADIOLOGY DEPARTMENT (Centered)
  yPos = 65
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const deptText = 'RADIOLOGY DEPARTMENT'
  const deptWidth = doc.getTextWidth(deptText)
  doc.text(deptText, (210 - deptWidth) / 2, yPos)

  // Exam Type (Centered)
  yPos += 8
  doc.setFontSize(11)
  const examType = reportData.exam_type || 'N/A'
  const examWidth = doc.getTextWidth(examType)
  doc.text(examType, (210 - examWidth) / 2, yPos)

  // Findings
  yPos += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const findings = reportData.findings || 'No findings recorded.'
  const findingsLines = doc.splitTextToSize(findings, 180)
  doc.text(findingsLines, 15, yPos)
  yPos += findingsLines.length * 5 + 5

  // IMPRESSION
  yPos += 5
  doc.setFont('helvetica', 'bold')
  doc.text('IMPRESSION:', 15, yPos)
  yPos += 6
  
  doc.setFont('helvetica', 'normal')
  const impression = reportData.impression || 'No impression recorded.'
  const impressionLines = doc.splitTextToSize(impression, 180)
  doc.text(impressionLines, 15, yPos)
  yPos += impressionLines.length * 5 + 5

  // RECOMMENDATIONS (if available)
  if (reportData.recommendations && reportData.recommendations.trim() !== '') {
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMMENDATIONS:', 15, yPos)
    yPos += 6
    
    doc.setFont('helvetica', 'normal')
    const recommendations = reportData.recommendations
    const recommendationsLines = doc.splitTextToSize(recommendations, 180)
    doc.text(recommendationsLines, 15, yPos)
    yPos += recommendationsLines.length * 5 + 10
  } else {
    yPos += 10
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  // Footer - Signatures
  yPos = Math.max(yPos, 250) // Ensure footer is near bottom
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Technologist signature (Left)
  doc.text(formData.technologistName, 15, yPos)
  yPos += 5
  doc.text('Radiologic Technologist', 15, yPos)

  // Doctor signature (Right)
  yPos -= 5
  const doctorName = `${reportData.assigned_radiologist || 'N/A'}, ${formData.doctorCredentials}`
  doc.text(doctorName, 210 - doc.getTextWidth(doctorName) - 15, yPos)
  yPos += 5
  doc.text('Radiologist', 210 - doc.getTextWidth('Radiologist') - 15, yPos)

  // Footer note
  yPos += 10
  doc.line(15, yPos, 195, yPos)
  yPos += 5
  
  doc.setFontSize(8)
  const note1 = 'The above description are based on the radiographic findings and should be correlated with the clinical findings and other ancillary'
  const note2 = 'procedures by your attending physician'
  const note3 = 'Note: Kindly bring this result together with the film on your next checkup and examination for comparison'
  
  const note1Width = doc.getTextWidth(note1)
  const note2Width = doc.getTextWidth(note2)
  const note3Width = doc.getTextWidth(note3)
  
  doc.text(note1, (210 - note1Width) / 2, yPos)
  yPos += 4
  doc.text(note2, (210 - note2Width) / 2, yPos)
  yPos += 5
  doc.text(note3, (210 - note3Width) / 2, yPos)

  // Save the PDF
  const fileName = `Report_${reportData.study_id || 'Unknown'}_${patientName.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
