
import { jsPDF } from 'jspdf';
import { ScheduleItem, Sponsor, Tournament } from '@/types';
import { getCategoryDisplay } from '../categoryUtils';

// Helper function for text wrapping
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const lines = [];
  let line = '';
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize() / doc.internal.scaleFactor;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  
  if (line) {
    lines.push(line);
  }
  
  return lines;
};

// Function to render schedule to PDF
export const renderScheduleToPDF = (
  doc: jsPDF, 
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
): void => {
  // Set font
  doc.setFont('helvetica', 'normal');
  let yPos = 20; // Initial y position
  
  // Add title
  doc.setFontSize(18);
  doc.text(tournament.name + ' - Zeitplan', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  // Add date
  yPos += 8;
  doc.setFontSize(12);
  const formattedDate = tournament.date 
    ? new Date(tournament.date).toLocaleDateString('de-CH') 
    : 'Kein Datum';
  doc.text(formattedDate, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  // Add main sponsors if any
  if (mainSponsors.length > 0) {
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Hauptsponsoren', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    
    // Since we can't add images easily without URLs, we'll just list sponsor names
    yPos += 8;
    doc.setFontSize(12);
    
    mainSponsors.forEach((sponsor, index) => {
      doc.text(sponsor.name, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      
      // Add line break every 3 sponsors
      if ((index + 1) % 3 === 0) {
        yPos += 2;
      }
    });
  }
  
  // Add schedule table header
  yPos += 15;
  doc.setFontSize(14);
  doc.text('Zeitplan', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Zeit', 20, yPos);
  doc.text('Programm', 60, yPos);
  doc.text('Kategorie', 150, yPos);
  
  doc.setLineWidth(0.2);
  yPos += 2;
  doc.line(20, yPos, 190, yPos);
  
  // Sort schedule by start time
  const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Add schedule items
  doc.setFont('helvetica', 'normal');
  
  sortedSchedule.forEach((item, index) => {
    yPos += 8;
    
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      
      // Add header on new page
      doc.setFont('helvetica', 'bold');
      doc.text('Zeit', 20, yPos);
      doc.text('Programm', 60, yPos);
      doc.text('Kategorie', 150, yPos);
      
      yPos += 2;
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
    }
    
    // Add alternating row background (light gray)
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, 170, 10, 'F');
    }
    
    // Add time
    doc.text(`${item.startTime} - ${item.endTime}`, 20, yPos);
    
    // Add title and description
    doc.setFont('helvetica', 'bold');
    const wrappedTitle = wrapText(doc, item.title, 80);
    doc.text(wrappedTitle[0], 60, yPos);
    
    // Add description if available
    if (wrappedTitle.length > 1 || item.description) {
      doc.setFont('helvetica', 'normal');
      
      // Add rest of wrapped title first
      for (let i = 1; i < wrappedTitle.length; i++) {
        yPos += 5;
        doc.text(wrappedTitle[i], 60, yPos);
      }
      
      // Then add description
      if (item.description) {
        yPos += 5;
        const wrappedDesc = wrapText(doc, item.description, 80);
        doc.setTextColor(100, 100, 100);
        
        for (let i = 0; i < wrappedDesc.length; i++) {
          doc.text(wrappedDesc[i], 60, yPos);
          yPos += 5;
        }
        
        // Reset color and adjust position
        doc.setTextColor(0, 0, 0);
        yPos -= 5; // Adjust back the last line increase
      }
    }
    
    // Add category
    doc.setFont('helvetica', 'normal');
    const categoryText = item.category ? getCategoryDisplay(item.category) : '-';
    doc.text(categoryText, 150, yPos);
    
    // Add row separator
    yPos += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yPos, 190, yPos);
    
    // Add extra space after each item
    yPos += 2;
  });
  
  // Add footer
  yPos = doc.internal.pageSize.height - 10;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Erstellt am ${new Date().toLocaleDateString('de-CH')}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  doc.setTextColor(0, 0, 0);
};
