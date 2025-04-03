
import { jsPDF } from 'jspdf';
import { Tournament, GroupCategory, GroupSize } from '@/types';
import { renderResultsToPDF } from './pdfResultsRenderer';
import { downloadHTMLAsFile, formatResultsForPDF, parseGroupCategoryString } from './baseUtils';
import { generateResultsHTMLContent } from './html/htmlResultsGenerator';

// Function to generate PDF of the results
export const generateResultsPDF = (options: {
  results: any[],
  category: string,
  tournament: Tournament,
  sponsors: any[]
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
    const individualResults: Record<string, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    // Populate the correct structure based on the category
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category] = formattedResults;
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
    
    const individualResults: Record<string, any[]> = {
      'kids': [],
      'juniors': [],
      'active': []
    };
    
    const groupResults: Record<string, any[]> = {};
    
    if (category === 'kids' || category === 'juniors' || category === 'active') {
      individualResults[category] = formattedResults;
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
