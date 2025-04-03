
import { Sponsor } from '@/types';

// Generate HTML for sponsor logo
export const generateSponsorLogoHTML = (sponsor: Sponsor): string => {
  const logoSrc = sponsor.logo || 'placeholder.svg';
  
  if (sponsor.websiteUrl) {
    return `
    <a href="${sponsor.websiteUrl}" target="_blank" rel="noopener noreferrer">
      <img 
        src="${logoSrc}" 
        alt="${sponsor.name}" 
        title="${sponsor.name}" 
        class="sponsor-logo"
      />
    </a>`;
  } else {
    return `
    <img 
      src="${logoSrc}" 
      alt="${sponsor.name}" 
      title="${sponsor.name}" 
      class="sponsor-logo"
    />`;
  }
};

// Generate HTML content for sponsors section
export const generateSponsorsHTMLContent = (sponsors: Sponsor[]): string => {
  if (!sponsors || sponsors.length === 0) {
    return '';
  }
  
  let content = `<div class="sponsors-section">`;
  
  // Group sponsors by type
  const mainSponsors = sponsors.filter(s => s.type === 'main' || s.isMainSponsor);
  const prizeSponsors = sponsors.filter(s => s.type === 'prize');
  const bannerSponsors = sponsors.filter(s => s.type === 'banner');
  const donors = sponsors.filter(s => s.type === 'donor');
  
  // Add main sponsors
  if (mainSponsors.length > 0) {
    content += `
      <div class="sponsor-group">
        <h3>Hauptsponsoren</h3>
        <div class="sponsor-logos">
          ${mainSponsors.map(sponsor => generateSponsorLogoHTML(sponsor)).join('')}
        </div>
      </div>
    `;
  }
  
  // Add prize sponsors
  if (prizeSponsors.length > 0) {
    content += `
      <div class="sponsor-group">
        <h3>Preissponsor</h3>
        <ul>
          ${prizeSponsors.map(sponsor => `<li>${sponsor.name}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Add banner sponsors
  if (bannerSponsors.length > 0) {
    content += `
      <div class="sponsor-group">
        <h3>Bannersponsoren</h3>
        <ul>
          ${bannerSponsors.map(sponsor => `<li>${sponsor.name}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Add donors
  if (donors.length > 0) {
    content += `
      <div class="sponsor-group">
        <h3>Gönner</h3>
        <ul>
          ${donors.map(sponsor => `<li>${sponsor.name}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  content += `</div>`;
  
  return content;
};
