
import { ScheduleItem, Sponsor, Tournament, Category, GroupCategory, GroupSize } from '@/types';
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

// Function to parse group category string into size and category
const parseGroupCategoryString = (categoryString: string): { size: GroupSize, category: GroupCategory } | null => {
  const parts = categoryString.split('_');
  if (parts.length >= 2) {
    const size = parts[0] as GroupSize;
    const category = parts.slice(1).join('_') as GroupCategory;
    return { size, category };
  }
  return null;
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

    // Create empty structures for individual and group results
    const individualResults: Record<Category, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    // Populate the correct structure based on the category
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category as Category] = results;
    } else {
      // Handle group categories like "three_kids_juniors"
      const groupInfo = parseGroupCategoryString(category);
      if (groupInfo) {
        const key = `${groupInfo.size}_${groupInfo.category}`;
        groupResults[key] = results;
      } else {
        // Fallback to the old 'group' key if parsing fails
        groupResults['group'] = results;
      }
    }
    
    // Render results content to PDF
    renderResultsToPDF(doc, individualResults, groupResults, sponsors, tournament.name);
    
    // Save and download the PDF file
    doc.save(`ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML if PDF generation fails
    const individualResults: Record<Category, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category as Category] = results;
    } else {
      const groupInfo = parseGroupCategoryString(category);
      if (groupInfo) {
        const key = `${groupInfo.size}_${groupInfo.category}`;
        groupResults[key] = results;
      } else {
        groupResults['group'] = results;
      }
    }
    
    const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournament.name);
    
    downloadHTMLAsFile(
      content, 
      `ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`
    );
    console.log('Fallback to HTML format due to error');
  }
};
