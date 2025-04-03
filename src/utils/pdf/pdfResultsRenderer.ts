
import { jsPDF } from 'jspdf';
import { Category } from '@/types';
import { renderIndividualResultsToPDF } from './renderIndividualResults';
import { renderGroupResultsToPDF } from './renderGroupResults';
import { addFooterToPDF } from './pdfFooterUtils';

// Main function to render results to PDF
export const renderResultsToPDF = (
  doc: jsPDF,
  individualResults: Record<Category, any[]>,
  groupResults: Record<string, any[]>,
  tournamentName: string
): void => {
  // Set font
  doc.setFont('helvetica', 'normal');
  let yPos = 20; // Initial y position
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Ergebnisse ${tournamentName}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  // Add date
  yPos += 8;
  doc.setFontSize(12);
  const currentDate = new Date().toLocaleDateString('de-CH');
  doc.text(`Erstellt am ${currentDate}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  // Add individual results section title
  yPos += 15;
  doc.setFontSize(16);
  doc.text('Einzelbewertungen', 20, yPos);
  
  // Render individual results
  yPos = renderIndividualResultsToPDF(doc, individualResults, yPos);
  
  // Add group results section title if there are any group results
  const hasGroupResults = Object.values(groupResults).some(arr => arr.length > 0);
  
  if (hasGroupResults) {
    yPos = Math.min(yPos + 15, 270); // Add space but avoid page overflow
    
    // If we're close to the end of the page, add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Gruppenbewertungen', 20, yPos);
    
    // Render group results
    yPos = renderGroupResultsToPDF(doc, groupResults, yPos);
  }
  
  // Add footer to all pages
  addFooterToPDF(doc);
};
