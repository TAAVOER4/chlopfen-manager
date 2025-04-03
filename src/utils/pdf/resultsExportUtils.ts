
import { jsPDF } from 'jspdf';
import { Tournament, Category } from '@/types';
import { renderResultsToPDF } from './pdfResultsRenderer';
import { downloadHTMLAsFile, formatResultsForPDF, parseGroupCategoryString } from './baseUtils';
import { 
  generateIndividualResultsHTMLContent,
  generateGroupResultsHTMLContent
} from './htmlGeneratorUtils';

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
  
  return { individualResults, groupResults };
}

// Handle errors in PDF generation by falling back to HTML
function handlePDFGenerationError(results: any[], category: string, sponsors: any[], tournament: Tournament) {
  // Format results and prepare data structures
  const formattedResults = formatResultsForPDF(results || []);
  const { individualResults, groupResults } = prepareResultsData(category, formattedResults);
  
  // Generate HTML content with our modular structure
  const htmlContent = generateResultsHTML(individualResults, groupResults, sponsors, tournament.name);
  
  // Download as HTML file
  const filename = `ergebnisse_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`;
  downloadHTMLAsFile(htmlContent, filename);
  console.log('Fallback to HTML format due to error');
}

// Function to create the complete HTML document for results
function generateResultsHTML(
  individualResults: Record<Category, any[]>,
  groupResults: Record<string, any[]>,
  sponsors: any[],
  tournamentName: string
): string {
  const title = `Ergebnisse ${tournamentName}`;
  
  // Start building HTML content with the document structure
  let content = `
  <!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #0056b3;
        text-align: center;
        margin-bottom: 30px;
      }
      h2 {
        color: #0056b3;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
        margin-top: 30px;
      }
      h3 {
        color: #0056b3;
        margin-top: 25px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      th, td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      .medal-position {
        font-weight: bold;
      }
      .medal-1 {
        color: #FFD700; /* Gold */
      }
      .medal-2 {
        color: #C0C0C0; /* Silver */
      }
      .medal-3 {
        color: #CD7F32; /* Bronze */
      }
      .sponsor {
        font-style: italic;
        color: #666;
        margin-top: 10px;
        margin-bottom: 20px;
      }
      .rank-sponsor {
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
      .category-section {
        margin-bottom: 40px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 20px;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>Erstellt am ${new Date().toLocaleDateString('de-CH')}</p>
  `;
  
  // Add individual results
  const hasIndividualResults = Object.values(individualResults).some(arr => arr.length > 0);
  
  if (hasIndividualResults) {
    content += generateIndividualResultsHTMLContent(individualResults, sponsors);
  }
  
  // Add group results
  const hasGroupResults = Object.values(groupResults).some(arr => arr.length > 0);
  
  if (hasGroupResults) {
    content += generateGroupResultsHTMLContent(groupResults, sponsors);
  }
  
  // Add footer
  content += `
    <div class="footer">
      <p>© ${new Date().getFullYear()} Schweiz. Peitschenclub</p>
    </div>
  </body>
  </html>`;
  
  return content;
}
