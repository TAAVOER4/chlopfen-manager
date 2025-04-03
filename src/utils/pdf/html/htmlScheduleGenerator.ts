
import { ScheduleItem, Sponsor, Tournament } from '@/types';
import { generateSponsorLogoHTML } from './htmlSponsorGenerator';

// Function to generate HTML content for the schedule
export const generateScheduleHTMLContent = (
  schedule: ScheduleItem[],
  mainSponsors: Sponsor[],
  tournament: Tournament
): string => {
  const title = `Zeitplan ${tournament.name}`;
  
  // Sort schedule items by start time
  const sortedSchedule = [...schedule].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Group schedule items by time slot
  const timeSlots: Record<string, ScheduleItem[]> = {};
  
  sortedSchedule.forEach(item => {
    if (!timeSlots[item.startTime]) {
      timeSlots[item.startTime] = [];
    }
    timeSlots[item.startTime].push(item);
  });
  
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
      .schedule-item {
        margin-bottom: 15px;
        padding: 10px;
        border-left: 4px solid #0056b3;
        background-color: #f8f9fa;
      }
      .time {
        font-weight: bold;
        color: #0056b3;
      }
      .title {
        font-weight: bold;
        margin: 5px 0;
      }
      .description {
        color: #666;
        font-style: italic;
      }
      .category {
        display: inline-block;
        margin-top: 5px;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        background-color: #e9ecef;
      }
      .category.kids {
        background-color: #d4edda;
        color: #155724;
      }
      .category.juniors {
        background-color: #cce5ff;
        color: #004085;
      }
      .category.active {
        background-color: #f8d7da;
        color: #721c24;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 20px;
      }
      .sponsors {
        text-align: center;
        margin-top: 30px;
      }
      .sponsor-logo {
        max-width: 150px;
        max-height: 80px;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>Datum: ${new Date(tournament.date).toLocaleDateString('de-CH')}</p>
    <p>Ort: ${tournament.location}</p>
  `;
  
  // Add schedule items
  content += `<h2>Zeitplan</h2>`;
  
  // Iterate through time slots in chronological order
  Object.keys(timeSlots).sort().forEach(timeSlot => {
    const items = timeSlots[timeSlot];
    
    items.forEach(item => {
      const categoryClass = item.category ? `category ${item.category}` : 'category';
      
      content += `
      <div class="schedule-item">
        <div class="time">${item.startTime} - ${item.endTime}</div>
        <div class="title">${item.title}</div>
        ${item.description ? `<div class="description">${item.description}</div>` : ''}
        ${item.category ? `<div class="${categoryClass}">${item.category}</div>` : ''}
      </div>
      `;
    });
  });
  
  // Add sponsors if available
  if (mainSponsors && mainSponsors.length > 0) {
    content += `<div class="sponsors">
      <h2>Hauptsponsoren</h2>
      ${mainSponsors.map(sponsor => generateSponsorLogoHTML(sponsor)).join('')}
    </div>`;
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
