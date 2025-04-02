import { ScheduleItem, Sponsor, Tournament, Category } from '@/types';
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
export const generateResultsPDF = (options: {
  results: any[],
  category: string,
  tournament: Tournament,
  sponsors: Sponsor[]
}): void => {
  // Extract options
  const { results, category, tournament, sponsors } = options;
  
  // Log generation info
  console.log('Generating results PDF');
  console.log('Results category:', category);
  console.log('Results count:', results.length);
  console.log('Sponsors:', sponsors.length);
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Create the structure expected by renderResultsToPDF
    const individualResults = category !== 'group' ? { [category]: results } : {};
    const groupResults = category === 'group' ? { 'group': results } : {};
    
    // Render results content to PDF
    renderResultsToPDF(doc, individualResults, groupResults, sponsors, tournament.name);
    
    // Save and download the PDF file
    doc.save(`ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML if PDF generation fails
    const individualResults = category !== 'group' ? { [category]: results } : {};
    const groupResults = category === 'group' ? { 'group': results } : {};
    const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournament.name);
    
    downloadHTMLAsFile(
      content, 
      `ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`
    );
    console.log('Fallback to HTML format due to error');
  }
};
