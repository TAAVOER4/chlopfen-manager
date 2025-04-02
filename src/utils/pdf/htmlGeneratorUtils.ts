
import { Category, ParticipantResult, GroupResult, Sponsor, Tournament } from '@/types';
import { generateScheduleHTMLContent } from './scheduleUtils';
import { generateIndividualResultsHTMLContent } from './resultsIndividualUtils';
import { generateGroupResultsHTMLContent } from './resultsGroupUtils';
import { generateSponsorsHTMLContent } from './sponsorUtils';

// Generate HTML content for results
export const generateResultsHTMLContent = (
  individualResults: Record<Category, ParticipantResult[]>,
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[],
  tournamentName: string
): string => {
  const currentDate = new Date().toLocaleDateString('de-CH');
  
  // Start building the HTML content
  let content = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ergebnisse ${tournamentName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .category-section {
          margin-bottom: 40px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .medal-position {
          font-weight: bold;
        }
        .medal-1 { color: #FFD700; }
        .medal-2 { color: #C0C0C0; }
        .medal-3 { color: #CD7F32; }
        .sponsor {
          font-style: italic;
          color: #555;
          margin-top: -20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .rank-sponsor {
          font-style: italic;
          color: #555;
          font-size: 0.9em;
        }
        .sponsor-list {
          margin-top: 50px;
          text-align: center;
        }
        .sponsor-category {
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ergebnisse ${tournamentName}</h1>
        <p>Erstellt am ${currentDate}</p>
      </div>
  `;
  
  // Add individual results
  content += generateIndividualResultsHTMLContent(individualResults, sponsors);
  
  // Add group results
  content += generateGroupResultsHTMLContent(groupResults, sponsors);
  
  // Add sponsors list at the end
  content += generateSponsorsHTMLContent(sponsors);
  
  // Close HTML
  content += `
    <div style="margin-top: 30px; text-align: center; color: #888;">
      <p>© ${new Date().getFullYear()} Schweiz. Peitschenclub</p>
    </div>
  </body>
  </html>
  `;
  
  return content;
};
