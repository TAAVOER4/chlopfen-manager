
import { jsPDF } from 'jspdf';
import { Tournament } from '@/types';
import { renderResultsToPDF } from './pdfResultsRenderer';
import { downloadHTMLAsFile, formatResultsForPDF, parseGroupCategoryString } from './baseUtils';
import { generateResultsHTMLContent } from './htmlGeneratorUtils';

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

    // Format results and prepare data structures
    const formattedResults = formatResultsForPDF(results || []);
    const { individualResults, groupResults } = prepareResultsData(category, formattedResults);
    
    // Render results content to PDF
    renderResultsToPDF(doc, individualResults, groupResults, tournament.name);
    
    // Save and download the PDF file
    const filename = `ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    doc.save(filename);
    
    console.log('PDF successfully generated');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to HTML generation
    handlePDFGenerationError(results, category, sponsors, tournament);
  }
};

// Helper function to organize results into the correct data structure
function prepareResultsData(category: string, formattedResults: any[]) {
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
  
  return { individualResults, groupResults };
}

// Handle errors in PDF generation by falling back to HTML
function handlePDFGenerationError(results: any[], category: string, sponsors: any[], tournament: Tournament) {
  // Format results and prepare data structures
  const formattedResults = formatResultsForPDF(results || []);
  const { individualResults, groupResults } = prepareResultsData(category, formattedResults);
  
  // Generate HTML content
  const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournament.name);
  
  // Download as HTML file
  const filename = `ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`;
  downloadHTMLAsFile(content, filename);
  console.log('Fallback to HTML format due to error');
}
