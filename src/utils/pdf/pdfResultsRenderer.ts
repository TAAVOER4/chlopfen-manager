import { jsPDF } from 'jspdf';
import { Category, ParticipantResult, GroupResult, GroupCategory, Sponsor } from '@/types';
import { getCategoryDisplay } from '../categoryUtils';

// Helper function to determine if new page is needed
const checkForNewPage = (doc: jsPDF, yPos: number, headerFn?: () => void): number => {
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
    if (headerFn) headerFn();
  }
  return yPos;
};

// Main function to render results to PDF
export const renderResultsToPDF = (
  doc: jsPDF,
  individualResults: Record<Category, ParticipantResult[]>,
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[],
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
  
  // Add individual results
  yPos += 15;
  doc.setFontSize(16);
  doc.text('Einzelbewertungen', 20, yPos);
  
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
    doc.text('Jahrgang', 140, yPos);
    doc.text('Punkte', 170, yPos);
    
    doc.setLineWidth(0.2);
    yPos += 2;
    doc.line(20, yPos, 190, yPos);
    
    doc.setFont('helvetica', 'normal');
    
    // Add results rows
    results.forEach((result, index) => {
      yPos += 8;
      yPos = checkForNewPage(doc, yPos);
      
      // Add alternating row background (light gray)
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 5, 170, 10, 'F');
      }
      
      // Set medal highlighting
      if (result.rank <= 3) {
        switch(result.rank) {
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
      doc.text(result.rank.toString(), 20, yPos);
      
      // Reset color and font for other columns
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      // Add participant info
      doc.text(`${result.participant.firstName} ${result.participant.lastName}`, 40, yPos);
      doc.text(result.participant.location, 100, yPos);
      doc.text(result.participant.birthYear.toString(), 140, yPos);
      doc.text((Math.round(result.totalScore * 10) / 10).toString(), 170, yPos);
      
      // Find sponsor for this rank and category
      const rankSponsor = sponsors.find(s => s.category === category && s.rank === result.rank);
      if (rankSponsor) {
        yPos += 5;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Sponsor: ${rankSponsor.name}`, 40, yPos);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
      }
      
      // Add row separator
      yPos += 3;
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPos, 190, yPos);
      
      // Add extra space
      yPos += 2;
    });
    
    // Add category sponsor if available
    const categorySponsor = sponsors.find(s => s.category === category && s.type === 'prize' && !s.rank);
    if (categorySponsor && results.length > 0) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Kategorie-Sponsor: ${categorySponsor.name}`, 20, yPos);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      yPos += 10;
    } else {
      yPos += 5;
    }
  });
  
  // Add group results
  yPos = checkForNewPage(doc, yPos);
  yPos += 15;
  doc.setFontSize(16);
  doc.text('Gruppenbewertungen', 20, yPos);
  
  // Process each group size and category combination
  const groupSizes = ['three', 'four'];
  const groupCategories = ['kids_juniors', 'active'];
  
  groupSizes.forEach(size => {
    groupCategories.forEach(category => {
      const key = `${size}_${category}`;
      const results = groupResults[key] || [];
      
      if (results.length === 0) return;
      
      yPos += 12;
      yPos = checkForNewPage(doc, yPos);
      
      // Add category header
      const sizeDisplay = size === 'three' ? '3er Gruppen' : '4er Gruppen';
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sizeDisplay} - ${getCategoryDisplay(category as GroupCategory)}`, 20, yPos);
      
      // Add table header
      yPos += 10;
      doc.setFontSize(11);
      doc.text('Rang', 20, yPos);
      doc.text('Gruppenname', 40, yPos);
      doc.text('Mitglieder', 90, yPos);
      doc.text('Punkte', 170, yPos);
      
      doc.setLineWidth(0.2);
      yPos += 2;
      doc.line(20, yPos, 190, yPos);
      
      doc.setFont('helvetica', 'normal');
      
      // Add results rows
      results.forEach((result, index) => {
        yPos += 8;
        yPos = checkForNewPage(doc, yPos);
        
        // Add alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, yPos - 5, 170, 10, 'F');
        }
        
        // Set medal highlighting
        if (result.rank <= 3) {
          switch(result.rank) {
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
        doc.text(result.rank.toString(), 20, yPos);
        
        // Reset color and font for other columns
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Add group info
        doc.text(`Gruppe ${result.groupId}`, 40, yPos);
        
        // Add members with text wrapping
        const members = result.members.map(m => `${m.firstName} ${m.lastName}`).join(', ');
        
        // Simple text wrapping for members
        const maxWidth = 70;
        if (doc.getStringUnitWidth(members) * doc.getFontSize() / doc.internal.scaleFactor > maxWidth) {
          // Split into multiple lines if too long
          const words = members.split(', ');
          let line = '';
          let firstLine = true;
          
          words.forEach((word, i) => {
            const testLine = line + (i > 0 && line ? ', ' : '') + word;
            const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize() / doc.internal.scaleFactor;
            
            if (testWidth > maxWidth && !firstLine) {
              doc.text(line, 90, yPos);
              yPos += 5;
              line = word;
            } else {
              line = testLine;
            }
            
            if (i === words.length - 1) {
              doc.text(line, 90, yPos);
            }
            
            firstLine = false;
          });
        } else {
          doc.text(members, 90, yPos);
        }
        
        // Add score
        doc.text((Math.round(result.totalScore * 10) / 10).toString(), 170, yPos);
        
        // Find sponsor for this rank and group category
        const rankSponsor = sponsors.find(s => s.category === category && s.rank === result.rank);
        if (rankSponsor) {
          yPos += 5;
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Sponsor: ${rankSponsor.name}`, 40, yPos);
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
        }
        
        // Add row separator
        yPos += 3;
        doc.setDrawColor(220, 220, 220);
        doc.line(20, yPos, 190, yPos);
        
        // Add extra space
        yPos += 2;
      });
      
      // Add group sponsor if available
      const groupSponsor = sponsors.find(s => s.category === category && s.type === 'prize' && !s.rank);
      if (groupSponsor && results.length > 0) {
        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Kategorie-Sponsor: ${groupSponsor.name}`, 20, yPos);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
      } else {
        yPos += 5;
      }
    });
  });
  
  // Add sponsors list
  yPos = checkForNewPage(doc, yPos);
  yPos += 15;
  doc.setFontSize(16);
  doc.text('Sponsoren', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  // Group sponsors by type
  const sponsorTypes = [
    { type: 'main', title: 'Hauptsponsoren' },
    { type: 'prize', title: 'Preissponsor' },
    { type: 'banner', title: 'Bannersponsoren' },
    { type: 'donor', title: 'Gönner' }
  ];
  
  sponsorTypes.forEach(({ type, title }) => {
    const typeSponsors = sponsors.filter(s => s.type === type);
    if (typeSponsors.length === 0) return;
    
    yPos += 12;
    yPos = checkForNewPage(doc, yPos);
    
    // Add sponsor type header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    // Add sponsors
    typeSponsors.forEach(sponsor => {
      yPos += 8;
      yPos = checkForNewPage(doc, yPos);
      
      doc.setFontSize(12);
      doc.text(sponsor.name, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    });
  });
  
  // Add footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    yPos = doc.internal.pageSize.height - 10;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`© ${new Date().getFullYear()} Schweiz. Peitschenclub`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  }
};
