
import { ScheduleItem, Sponsor, Tournament, Category, GroupCategory, GroupSize, ParticipantResult, GroupResult } from '@/types';
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
  if (!categoryString || typeof categoryString !== 'string') {
    return null;
  }

  const parts = categoryString.split('_');
  if (parts.length >= 2) {
    const size = parts[0] as GroupSize;
    const category = parts.slice(1).join('_') as GroupCategory;
    return { size, category };
  }
  return null;
};

// Helper function to format results for PDF generation
const formatResultsForPDF = (results: any[]): any[] => {
  if (!results || !Array.isArray(results)) {
    console.warn('Results is not an array or is undefined', results);
    return [];
  }
  
  return results.map(result => {
    if (!result) return null;
    
    // Check if the result already has the expected format (from admin panel)
    if (result.name && result.location !== undefined) {
      return result;
    }
    
    // For results from the result service with participant objects
    if (result.participant) {
      return {
        rank: result.rank,
        name: `${result.participant.firstName} ${result.participant.lastName}`,
        location: result.participant.location || '',
        birthYear: result.participant.birthYear,
        score: result.totalScore
      };
    }
    
    // For group results
    if (result.members && Array.isArray(result.members)) {
      return {
        rank: result.rank,
        groupId: result.groupId,
        members: result.members.map((m: any) => ({
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          location: m.location || ''
        })),
        score: result.totalScore
      };
    }
    
    // Default case - return the original result if we can't format it
    return result;
  }).filter(result => result !== null);
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
  console.log('Results count:', results?.length || 0);
  console.log('Sponsors:', sponsors.length);
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Format results to ensure they have the expected structure
    const formattedResults = formatResultsForPDF(results || []);
    console.log('Formatted results for PDF:', formattedResults);
    
    // Create empty structures for individual and group results
    const individualResults: Record<Category, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    // Populate the correct structure based on the category
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category as Category] = formattedResults;
    } else {
      // Handle group categories like "three_kids_juniors"
      const groupInfo = parseGroupCategoryString(category);
      if (groupInfo) {
        const key = `${groupInfo.size}_${groupInfo.category}`;
        groupResults[key] = formattedResults;
        console.log(`Added ${formattedResults.length} results to group key ${key}`);
      } else {
        // Fallback to the old 'group' key if parsing fails
        groupResults['group'] = formattedResults;
        console.log(`Fallback: Added ${formattedResults.length} results to default group key`);
      }
    }
    
    // Render results content to PDF
    renderResultsToPDF(doc, individualResults, groupResults, tournament.name);
    
    // Save and download the PDF file
    doc.save(`ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML if PDF generation fails - but first ensure results are formatted
    const formattedResults = formatResultsForPDF(results || []);
    
    const individualResults: Record<Category, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category as Category] = formattedResults;
    } else {
      const groupInfo = parseGroupCategoryString(category);
      if (groupInfo) {
        const key = `${groupInfo.size}_${groupInfo.category}`;
        groupResults[key] = formattedResults;
      } else {
        groupResults['group'] = formattedResults;
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
