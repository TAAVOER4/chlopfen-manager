
import { Participant } from '../types';
import { mockGroups } from '../data/mockData';

/**
 * Generates a group name based on participants' locations and common attributes.
 */
export const generateGroupName = (participants: Participant[]): string => {
  if (participants.length === 0) {
    return '';
  }
  
  // Get all unique locations
  const locations = [...new Set(participants.map(p => p.location))];
  
  // Use the first location or concatenate multiple if necessary
  let locationName = locations[0];
  if (locations.length > 1) {
    // Use the most common location if there are multiple
    const locationCounts: Record<string, number> = {};
    participants.forEach(p => {
      locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
    });
    
    // Sort locations by frequency
    locationName = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  
  // Get the category name
  const category = participants[0].category;
  
  // Generate a suffix based on the group composition
  let suffix = '';
  switch (category) {
    case 'kids':
      suffix = 'Jungs';
      break;
    case 'juniors':
      suffix = 'Junioren';
      break;
    case 'active':
      suffix = 'Elite';
      break;
  }
  
  return `${locationName} ${suffix}`;
};

/**
 * Checks if a group with the same participants already exists.
 * Optionally excludes a specific group (useful for editing).
 */
export const isDuplicateGroup = (participantIds: number[], excludeGroupId?: number): boolean => {
  return mockGroups.some(group => {
    // Skip the group being edited
    if (excludeGroupId !== undefined && group.id === excludeGroupId) {
      return false;
    }
    
    // Check if the group has the same number of participants
    if (group.participantIds.length !== participantIds.length) {
      return false;
    }
    
    // Check if all participantIds are in the group
    return participantIds.every(id => group.participantIds.includes(id));
  });
};
