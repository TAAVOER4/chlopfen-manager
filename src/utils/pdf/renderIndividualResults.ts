
import { jsPDF } from 'jspdf';
import { Category, ParticipantResult } from '@/types';
import { getCategoryDisplay } from '../categoryUtils';

// Helper function to determine if new page is needed
export const checkForNewPage = (doc: jsPDF, yPos: number, headerFn?: () => void): number => {
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
    if (headerFn) headerFn();
  }
  return yPos;
};

// Helper function to safely check if an object has a property
export const hasProperty = (obj: any, prop: string): boolean => {
  return obj && typeof obj === 'object' && prop in obj;
};

// Function to render individual results to PDF
export const renderIndividualResultsToPDF = (
  doc: jsPDF,
  individualResults: Record<Category, any[]>,
  yPos: number
): number => {
  // Process each category for individual results
  const categories: Category[] = ['kids', 'juniors', 'active'];
  categories.forEach(category => {
    const results = individualResults[category] || [];
    if (results.length === 0) return;
    
    yPos += 12;
    yPos = checkForNewPage(doc, yPos);
    
    // Add category header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(getCategoryDisplay(category), 20, yPos);
    
    // Add table header
    yPos += 10;
    doc.setFontSize(11);
    doc.text('Rang', 20, yPos);
    doc.text('Name', 40, yPos);
    doc.text('Wohnort', 100, yPos);
    doc.text('Punkte', 170, yPos);
    
    doc.setLineWidth(0.2);
    yPos += 2;
    doc.line(20, yPos, 190, yPos);
    
    doc.setFont('helvetica', 'normal');
    
    // Add results rows
    results.forEach((result, index) => {
      if (!result) return; // Skip undefined results
      
      yPos += 8;
      yPos = checkForNewPage(doc, yPos);
      
      // Add alternating row background (light gray)
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 5, 170, 10, 'F');
      }
      
      // Set medal highlighting
      const rank = result.rank || index + 1;
      if (rank <= 3) {
        switch(rank) {
          case 1:
            doc.setTextColor(255, 215, 0); // Gold
            break;
          case 2:
            doc.setTextColor(192, 192, 192); // Silver
            break;
          case 3:
            doc.setTextColor(205, 127, 50); // Bronze
            break;
        }
        doc.setFont('helvetica', 'bold');
      }
      
      // Add rank
      doc.text(rank.toString(), 20, yPos);
      
      // Reset color and font for other columns
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      // Add participant info - safely check properties
      const name = hasProperty(result, 'name') ? result.name : 
                  (hasProperty(result, 'participant') ? 
                    `${result.participant.firstName} ${result.participant.lastName}` : 
                    'N/A');
                    
      const location = hasProperty(result, 'location') ? result.location : 
                      (hasProperty(result, 'participant') ? 
                        result.participant.location : 
                        'N/A');
                        
      const score = hasProperty(result, 'score') ? result.score : 
                   (hasProperty(result, 'totalScore') ? 
                     result.totalScore : 
                     'N/A');
      
      doc.text(name, 40, yPos);
      doc.text(location, 100, yPos);
      doc.text(typeof score === 'number' ? (Math.round(score * 10) / 10).toString() : score.toString(), 170, yPos);
      
      // Add row separator
      yPos += 3;
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPos, 190, yPos);
      
      // Add extra space
      yPos += 2;
    });
    
    // Add extra space after each category
    yPos += 5;
  });
  
  return yPos;
};
