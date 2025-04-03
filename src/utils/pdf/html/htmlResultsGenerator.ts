
import { Category, GroupCategory } from '@/types';
import { getCategoryDisplay } from '../../categoryUtils';

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
    content += generateIndividualResultsHTML(individualResults, sponsors);
  }
  
  // Add group results
  const hasGroupResults = Object.values(groupResults).some(arr => arr.length > 0);
  
  if (hasGroupResults) {
    content += generateGroupResultsHTML(groupResults, sponsors);
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

// Helper function for individual results HTML
const generateIndividualResultsHTML = (
  individualResults: Record<Category, any[]>,
  sponsors: any[]
): string => {
  let content = `<h2>Einzelbewertungen</h2>`;
  
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
            ${result.name || `${result.participant?.firstName || ''} ${result.participant?.lastName || ''}`}
            ${rankSponsor ? `<div class="rank-sponsor">Sponsor: ${rankSponsor.name}</div>` : ''}
          </td>
          <td>${result.location || result.participant?.location || ''}</td>
          <td>${typeof result.score === 'number' ? Math.round(result.score * 10) / 10 : 
               typeof result.totalScore === 'number' ? Math.round(result.totalScore * 10) / 10 : 'N/A'}</td>
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
  
  return content;
};

// Helper function for group results HTML
const generateGroupResultsHTML = (
  groupResults: Record<string, any[]>,
  sponsors: any[]
): string => {
  let content = `<h2>Gruppenbewertungen</h2>`;
  
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
        
        // Get members string based on available data
        let members = '';
        if (typeof result.location === 'string') {
          members = result.location;
        } else if (result.members && Array.isArray(result.members)) {
          members = result.members
            .map((m: any) => `${m.firstName || ''} ${m.lastName || ''}`.trim())
            .join(', ');
        }
        
        // Find sponsor for this rank and group category
        const rankSponsor = sponsors.find(s => s.category === category && s.rank === result.rank);
        const groupName = result.name || `Gruppe ${result.groupId || ''}`;
        
        content += `
          <tr>
            <td${medalClass}>${result.rank}</td>
            <td>
              ${groupName}
              ${rankSponsor ? `<div class="rank-sponsor">Sponsor: ${rankSponsor.name}</div>` : ''}
            </td>
            <td>${members}</td>
            <td>${typeof result.score === 'number' ? Math.round(result.score * 10) / 10 : 
                 typeof result.totalScore === 'number' ? Math.round(result.totalScore * 10) / 10 : 'N/A'}</td>
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
  
  return content;
};
