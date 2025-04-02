
import { ScheduleItem, Sponsor, Tournament, Category, ParticipantResult, GroupResult } from '@/types';
import { generateScheduleHTMLContent } from './scheduleUtils';
import { generateResultsHTMLContent } from './htmlGeneratorUtils';

// Helper function to trigger download of generated HTML content as a file
export const downloadHTMLAsFile = (content: string, filename: string): void => {
  // Create a blob with the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Function to generate PDF of the schedule
export const generateSchedulePDF = (
  schedule: ScheduleItem[], 
  mainSponsors: Sponsor[],
  tournament: Tournament
): void => {
  // Log generation info
  console.log('Generating PDF for tournament:', tournament.name);
  console.log('Schedule items:', schedule.length);
  console.log('Main sponsors:', mainSponsors.length);
  
  // Generate the HTML content for the schedule
  const content = generateScheduleHTMLContent(schedule, mainSponsors, tournament);
  
  // Trigger download of the HTML file
  downloadHTMLAsFile(
    content, 
    `zeitplan_${tournament.name.toLowerCase().replace(/\s+/g, '-')}.html`
  );
};

// Function to generate PDF of the results
export const generateResultsPDF = (
  individualResults: Record<Category, ParticipantResult[]>,
  groupResults: Record<string, GroupResult[]>,
  sponsors: Sponsor[],
  tournamentName: string
): void => {
  // Log generation info
  console.log('Generating results PDF');
  console.log('Individual results:', Object.keys(individualResults).length, 'categories');
  console.log('Group results:', Object.keys(groupResults).length, 'categories');
  console.log('Sponsors:', sponsors.length);
  
  // Generate the HTML content for results
  const content = generateResultsHTMLContent(individualResults, groupResults, sponsors, tournamentName);
  
  // Trigger download of the HTML file
  downloadHTMLAsFile(
    content, 
    `ergebnisse_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.html`
  );
};
