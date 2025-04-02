import { ScheduleItem, Sponsor, Tournament, Category, ParticipantResult, GroupResult } from '@/types';
import { jsPDF } from 'jspdf';
import { generateScheduleHTMLContent } from './scheduleUtils';
import { generateResultsHTMLContent } from './htmlGeneratorUtils';
import { renderScheduleToPDF } from './pdfScheduleRenderer';
import { renderResultsToPDF } from './pdfResultsRenderer';

// Legacy function to download HTML content as a file - keep for backwards compatibility
export const downloadHTMLAsFile = (content: string, filename: string): void => {
  // Create a blob with the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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
    
    // Save and download the PDF file
    doc.save(`zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML if PDF generation fails
    const content = generateScheduleHTMLContent(schedule, mainSponsors, tournament);
    downloadHTMLAsFile(
      content, 
      `zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`
    );
    console.log('Fallback to HTML format due to error');
  }
};

// Function to generate PDF of the results
export const generateResultsPDF = (
  individualResults: Record<Category, ParticipantResult[]>,
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[],
  tournamentName: string
): void => {
  // Log generation info
  console.log('Generating results PDF');
  console.log('Individual results:', Object.keys(individualResults).length, 'categories');
  console.log('Group results:', Object.keys(groupResults).length, 'categories');
  console.log('Sponsors:', sponsors.length);
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Render results content to PDF
    renderResultsToPDF(doc, individualResults, groupResults, sponsors, tournamentName);
    
    // Save and download the PDF file
    doc.save(`ergebnisse_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML if PDF generation fails
    const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournamentName);
    downloadHTMLAsFile(
      content, 
      `ergebnisse_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.html`
    );
    console.log('Fallback to HTML format due to error');
  }
};
