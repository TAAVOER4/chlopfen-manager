
import { Category } from '@/types';
import { getCategoryDisplay } from '../../categoryUtils';

// Helper function for individual results HTML
export const generateIndividualResultsHTMLContent = (
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
