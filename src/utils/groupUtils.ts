
import { Participant } from '../types';
import { mockGroups } from '../data/mockData';

/**
 * Generate a group name based on participants' full names
 * @param participants Array of participants
 * @returns Generated group name
 */
export const generateGroupName = (participants: Participant[]): string => {
  if (participants.length === 0) return '';
  
  // Use the full names of participants to generate a group name
  const fullNames = participants.map(p => `${p.firstName} ${p.lastName}`);
  
  if (fullNames.length === 1) {
    return `Gruppe ${fullNames[0]}`;
  } else if (fullNames.length === 2) {
    return `Gruppe ${fullNames[0]}-${fullNames[1]}`;
  } else if (fullNames.length === 3) {
    return `Gruppe ${fullNames[0]}-${fullNames[1]}-${fullNames[2]}`;
  } else if (fullNames.length === 4) {
    return `Gruppe ${fullNames[0]}-${fullNames[1]}-${fullNames[2]}-${fullNames[3]}`;
  }
  
  // Default case (should not happen)
  return `Gruppe ${fullNames.join('-')}`;
};

/**
 * Check if a group with the exact same participants already exists
 * @param participantIds Array of participant IDs to check
 * @param excludeGroupId Optional group ID to exclude from the check
 * @returns Boolean indicating if a duplicate group exists
 */
export const isDuplicateGroup = (participantIds: string[], excludeGroupId?: string): boolean => {
  // Sort the participantIds for consistent comparison
  const sortedIds = [...participantIds].sort();
  
  return mockGroups.some(group => {
    // Skip the current group being edited
    if (excludeGroupId && group.id === excludeGroupId) {
      return false;
    }
    
    // Only compare groups with the same number of participants
    if (group.participantIds.length !== sortedIds.length) {
      return false;
    }
    
    // Sort group participant IDs for comparison
    const groupSortedIds = [...group.participantIds].sort();
    
    // Check if all participants match
    return groupSortedIds.every((id, index) => id === sortedIds[index]);
  });
};
