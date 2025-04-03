
import { jsPDF } from 'jspdf';
import { ScheduleItem, Sponsor, Tournament } from '@/types';
import { renderScheduleToPDF } from './pdfScheduleRenderer';
import { downloadHTMLAsFile } from './baseUtils';
import { generateScheduleHTMLContent } from './html/htmlScheduleGenerator';

// Function to generate PDF of the schedule
export const generateSchedulePDF = (
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
): void => {
  // Log generation info
  console.log('Generating PDF for tournament:', tournament.name);
  console.log('Schedule items:', schedule.length);
  console.log('Main sponsors:', mainSponsors.length);
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Render schedule content to PDF
    renderScheduleToPDF(doc, schedule, mainSponsors, tournament);
    
    // Generate a clean filename
    const filename = `zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    
    // Save and download the PDF file
    doc.save(filename);
    
    console.log('PDF successfully generated');
  } catch (error) {
    handlePDFGenerationError(error, schedule, mainSponsors, tournament);
  }
};

// Handle errors in PDF generation by falling back to HTML
function handlePDFGenerationError(
  error: any,
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
): void {
  console.error('Error generating PDF:', error);
  
  // Fallback to HTML if PDF generation fails - use our modular HTML generator
  const content = generateScheduleHTMLContent(schedule, mainSponsors, tournament);
  const filename = `zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`;
  
  downloadHTMLAsFile(content, filename);
  console.log('Fallback to HTML format due to error');
}
