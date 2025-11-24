import jsPDF from 'jspdf'
import { Project, Scan } from '../types'
import { format } from 'date-fns'

export const generateProjectReport = async (
  project: Project,
  scans: Scan[]
): Promise<void> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = margin

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Project Report', margin, yPosition)
  yPosition += 15

  // Project Name
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(project.name, margin, yPosition)
  yPosition += 10

  // Project Details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Description: ${project.description}`, margin, yPosition)
  yPosition += 8
  doc.text(`Status: ${project.status.toUpperCase()}`, margin, yPosition)
  yPosition += 8
  doc.text(
    `Created: ${format(project.createdAt, 'MMM dd, yyyy')}`,
    margin,
    yPosition
  )
  yPosition += 8
  doc.text(
    `Last Updated: ${format(project.updatedAt, 'MMM dd, yyyy')}`,
    margin,
    yPosition
  )
  yPosition += 15

  // Scans Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Scans (${scans.length})`, margin, yPosition)
  yPosition += 10

  if (scans.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('No scans uploaded yet.', margin, yPosition)
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    scans.forEach((scan, index) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage()
        yPosition = margin
      }

      const scanLine = `${index + 1}. ${scan.name} (${scan.type}) - ${format(
        scan.uploadedAt,
        'MMM dd, yyyy'
      )}`
      doc.text(scanLine, margin, yPosition)
      yPosition += 7
    })
  }

  // Save PDF
  const fileName = `${project.name.replace(/\s+/g, '_')}_report.pdf`
  doc.save(fileName)
}
