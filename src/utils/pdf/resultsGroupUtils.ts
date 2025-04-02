
import { GroupCategory, GroupResult, Sponsor } from '@/types';
import { getCategoryDisplay } from '../categoryUtils';

// Helper function to generate HTML content for group results
export const generateGroupResultsHTMLContent = (
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[]
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
  
  return content;
};
