
import { Participant } from '../types';
import { mockGroups } from '../data/mockData';

/**
 * Generates a group name based on participants' full names joined with hyphens.
 */
export const generateGroupName = (participants: Participant[]): string => {
  if (participants.length === 0) {
    return '';
  }
  
  // Create the name by joining all participants' full names with hyphens
  const fullNames = participants.map(p => `${p.firstName} ${p.lastName}`);
  return `Gruppe ${fullNames.join('-')}`;
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
