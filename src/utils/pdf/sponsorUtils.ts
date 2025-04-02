
import { Sponsor } from '@/types';

// Helper function to generate HTML content for sponsors list
export const generateSponsorsHTMLContent = (sponsors: Sponsor[]): string => {
  let content = `
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
  
  // Close the sponsors list
  content += `</div>`;
  
  return content;
};
