
import { Category } from '@/types';
import { generateIndividualResultsHTMLContent } from './htmlIndividualResultsGenerator';
import { generateGroupResultsHTMLContent } from './htmlGroupResultsGenerator';

// Function to generate HTML content for results
export const generateResultsHTMLContent = (
  individualResults: Record<Category, any[]>,
  groupResults: Record<string, any[]>,
  sponsors: any[],
  tournamentName: string
): string => {
  const title = `Ergebnisse ${tournamentName}`;
  
  // Start building HTML content
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
};
