
import { Participant } from '../types';

/**
 * Generate a group name based on participants' first and last names
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
  } else {
    // For 3 or more participants, use first two names and "& Co."
    return `Gruppe ${fullNames[0]}-${fullNames[1]} & Co.`;
  }
};
