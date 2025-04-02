import { Category, ParticipantResult, GroupResult, Sponsor, Tournament, ScheduleItem } from '@/types';
import { generateIndividualResultsHTMLContent } from './resultsIndividualUtils';
import { generateGroupResultsHTMLContent } from './resultsGroupUtils';
import { generateSponsorsHTMLContent } from './sponsorUtils';
import { getCategoryDisplay } from '../categoryUtils';

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

// Generate HTML content for schedule
export const generateScheduleHTMLContent = (
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
): string => {
  // Format the date
  const formattedDate = tournament.date 
    ? new Date(tournament.date).toLocaleDateString('de-CH') 
    : 'Kein Datum';
  
  // Start building the HTML content
  let content = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zeitplan ${tournament.name}</title>
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
        .sponsors {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .sponsor {
          width: 150px;
        }
        .sponsor-logo {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
        }
        .sponsor-logo img {
          max-height: 70px;
          max-width: 100%;
        }
        .sponsor-name {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
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
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${tournament.name}</h1>
        <p>${formattedDate}</p>
      </div>
  `;
  
  // Add main sponsors if any
  if (mainSponsors.length > 0) {
    content += `
      <h2 style="text-align: center;">Hauptsponsoren</h2>
      <div class="sponsors">
    `;
    
    mainSponsors.forEach(sponsor => {
      content += `
        <div class="sponsor">
          <div class="sponsor-logo">
            ${sponsor.logo ? `<img src="${sponsor.logo}" alt="${sponsor.name} Logo">` : sponsor.name}
          </div>
          <div class="sponsor-name">${sponsor.name}</div>
        </div>
      `;
    });
    
    content += '</div>';
  }
  
  // Add the schedule
  content += `
    <h2>Zeitplan</h2>
    <table>
      <thead>
        <tr>
          <th>Zeit</th>
          <th>Programm</th>
          <th>Kategorie</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort schedule by start time
  const sortedSchedule = [...schedule].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Add each schedule item
  sortedSchedule.forEach(item => {
    content += `
      <tr>
        <td>${item.startTime} - ${item.endTime}</td>
        <td>
          <strong>${item.title}</strong>
          ${item.description ? `<br><span style="color: #666;">${item.description}</span>` : ''}
        </td>
        <td>${item.category ? getCategoryDisplay(item.category) : '-'}</td>
      </tr>
    `;
  });
  
  // Close the table and HTML
  content += `
      </tbody>
    </table>
    
    <div style="margin-top: 30px; text-align: center; color: #888;">
      <p>Erstellt am ${new Date().toLocaleDateString('de-CH')}</p>
    </div>
  </body>
  </html>
  `;
  
  return content;
};
