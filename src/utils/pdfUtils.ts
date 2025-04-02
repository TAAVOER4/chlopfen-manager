import { ScheduleItem, Sponsor, Tournament, ParticipantResult, GroupResult, Category, GroupCategory } from '@/types';
import { getCategoryDisplay } from './categoryUtils';

// Function to generate PDF of the schedule
export const generateSchedulePDF = (
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
) => {
  // Implementation of PDF generation
  // In a real implementation, this would use a library like jspdf or pdfmake
  
  console.log('Generating PDF for tournament:', tournament.name);
  console.log('Schedule items:', schedule.length);
  console.log('Main sponsors:', mainSponsors.length);
  
  // For simplicity, we'll just trigger a "fake" PDF download
  // In a real app, you would generate the PDF content here
  
  // Create a blob with minimal HTML representation of the schedule
  const content = generateHTMLContent(schedule, mainSponsors, tournament);
  
  // Create a blob from the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // In a real implementation, you would return the PDF as a blob or base64 string
  // or directly trigger the download of the PDF file
};

// Helper function to generate HTML content for the schedule
const generateHTMLContent = (
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

// Function to generate PDF of the results
export const generateResultsPDF = (
  individualResults: Record<Category, ParticipantResult[]>,
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[],
  tournamentName: string
) => {
  console.log('Generating results PDF');
  console.log('Individual results:', Object.keys(individualResults).length, 'categories');
  console.log('Group results:', Object.keys(groupResults).length, 'categories');
  console.log('Sponsors:', sponsors.length);
  
  // Create content for PDF
  const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournamentName);
  
  // Create a blob with the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `ergebnisse_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to generate HTML content for results
const generateResultsHTMLContent = (
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
  content += `<h2>Einzelbewertungen</h2>`;
  
  // Process each category for individual results
  const categories: Category[] = ['kids', 'juniors', 'active'];
  categories.forEach(category => {
    const results = individualResults[category] || [];
    if (results.length === 0) return;
    
    content += `
      <div class="category-section">
        <h3>${getCategoryDisplay(category)}</h3>
        <table>
          <thead>
            <tr>
              <th>Rang</th>
              <th>Name</th>
              <th>Wohnort</th>
              <th>Jahrgang</th>
              <th>Punkte</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    results.forEach(result => {
      const medalClass = result.rank <= 3 ? ` class="medal-position medal-${result.rank}"` : '';
      
      // Find sponsor for this rank and category
      const rankSponsor = sponsors.find(s => s.category === category && s.rank === result.rank);
      
      content += `
        <tr>
          <td${medalClass}>${result.rank}</td>
          <td>
            ${result.participant.firstName} ${result.participant.lastName}
            ${rankSponsor ? `<div class="rank-sponsor">Sponsor: ${rankSponsor.name}</div>` : ''}
          </td>
          <td>${result.participant.location}</td>
          <td>${result.participant.birthYear}</td>
          <td>${Math.round(result.totalScore * 10) / 10}</td>
        </tr>
      `;
    });
    
    content += `
          </tbody>
        </table>
    `;
    
    // Add category sponsor (for the category as a whole) if available
    const categorySponsor = sponsors.find(s => s.category === category && s.type === 'prize' && !s.rank);
    if (categorySponsor && results.length > 0) {
      content += `
        <div class="sponsor">
          Kategorie-Sponsor: ${categorySponsor.name}
        </div>
      `;
    }
    
    content += `</div>`;
  });
  
  // Add group results
  content += `<h2>Gruppenbewertungen</h2>`;
  
  // Process each group size and category combination
  const groupSizes = ['three', 'four'];
  const groupCategories = ['kids_juniors', 'active'];
  
  groupSizes.forEach(size => {
    groupCategories.forEach(category => {
      const key = `${size}_${category}`;
      const results = groupResults[key] || [];
      
      if (results.length === 0) return;
      
      const sizeDisplay = size === 'three' ? '3er Gruppen' : '4er Gruppen';
      content += `
        <div class="category-section">
          <h3>${sizeDisplay} - ${getCategoryDisplay(category as GroupCategory)}</h3>
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Gruppenname</th>
                <th>Mitglieder</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      results.forEach(result => {
        const medalClass = result.rank <= 3 ? ` class="medal-position medal-${result.rank}"` : '';
        const members = result.members.map(m => `${m.firstName} ${m.lastName}`).join(', ');
        
        // Find sponsor for this rank and group category
        const rankSponsor = sponsors.find(s => s.category === category && s.rank === result.rank);
        
        content += `
          <tr>
            <td${medalClass}>${result.rank}</td>
            <td>
              Gruppe ${result.groupId}
              ${rankSponsor ? `<div class="rank-sponsor">Sponsor: ${rankSponsor.name}</div>` : ''}
            </td>
            <td>${members}</td>
            <td>${Math.round(result.totalScore * 10) / 10}</td>
          </tr>
        `;
      });
      
      content += `
            </tbody>
          </table>
      `;
      
      // Add sponsor for group category if available
      const groupSponsor = sponsors.find(s => s.category === category && s.type === 'prize' && !s.rank);
      if (groupSponsor && results.length > 0) {
        content += `
          <div class="sponsor">
            Kategorie-Sponsor: ${groupSponsor.name}
          </div>
        `;
      }
      
      content += `</div>`;
    });
  });
  
  // Add sponsors list at the end
  content += `
    <div class="sponsor-list">
      <h2>Sponsoren</h2>
  `;
  
  // Group sponsors by type
  const sponsorTypes = [
    { type: 'main', title: 'Hauptsponsoren' },
    { type: 'prize', title: 'Preissponsor' },
    { type: 'banner', title: 'Bannersponsoren' },
    { type: 'donor', title: 'Gönner' }
  ];
  
  sponsorTypes.forEach(({ type, title }) => {
    const typeSponsors = sponsors.filter(s => s.type === type);
    if (typeSponsors.length === 0) return;
    
    content += `
      <div class="sponsor-category">
        <h3>${title}</h3>
        <ul style="list-style-type: none; padding: 0;">
    `;
    
    typeSponsors.forEach(sponsor => {
      content += `<li>${sponsor.name}</li>`;
    });
    
    content += `
        </ul>
      </div>
    `;
  });
  
  // Close the sponsors list and HTML
  content += `
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #888;">
      <p>© ${new Date().getFullYear()} Schweiz. Peitschenclub</p>
    </div>
  </body>
  </html>
  `;
  
  return content;
};
