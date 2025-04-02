import { jsPDF } from 'jspdf';

// Legacy function to download HTML content as a file - keep for backwards compatibility
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

// Helper function for formatting results for PDF generation
export const formatResultsForPDF = (results: any[]): any[] => {
  if (!results || !Array.isArray(results)) {
    console.warn('Results is not an array or is undefined', results);
    return [];
  }
  
  return results.map(result => {
    if (!result) return null;
    
    // Check if the result already has the expected format (from admin panel)
    if (result.name && result.location !== undefined) {
      return result;
    }
    
    // For results from the result service with participant objects
    if (result.participant) {
      return {
        rank: result.rank,
        name: `${result.participant.firstName} ${result.participant.lastName}`,
        location: result.participant.location || '',
        birthYear: result.participant.birthYear,
        score: result.totalScore
      };
    }
    
    // For group results
    if (result.members && Array.isArray(result.members)) {
      return {
        rank: result.rank,
        groupId: result.groupId,
        members: result.members.map((m: any) => ({
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          location: m.location || ''
        })),
        score: result.totalScore
      };
    }
    
    // Default case - return the original result if we can't format it
    return result;
  }).filter(result => result !== null);
};

// Function to parse group category string into size and category
export const parseGroupCategoryString = (categoryString: string): { size: string, category: string } | null => {
  if (!categoryString || typeof categoryString !== 'string') {
    return null;
  }

  const parts = categoryString.split('_');
  if (parts.length >= 2) {
    const size = parts[0];
    const category = parts.slice(1).join('_');
    return { size, category };
  }
  return null;
};
