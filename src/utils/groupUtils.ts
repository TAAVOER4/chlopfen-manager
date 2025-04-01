
import { Participant } from '../types';

/**
 * Generate a group name based on participants' last names
 * @param participants Array of participants
 * @returns Generated group name
 */
export const generateGroupName = (participants: Participant[]): string => {
  if (participants.length === 0) return '';
  
  // Use the last names of participants to generate a group name
  const lastNames = participants.map(p => p.lastName);
  
  if (lastNames.length === 1) {
    return `Gruppe ${lastNames[0]}`;
  } else if (lastNames.length === 2) {
    return `Gruppe ${lastNames[0]}-${lastNames[1]}`;
  } else {
    // For 3 or more participants, use first two names and "& Co."
    return `Gruppe ${lastNames[0]}-${lastNames[1]} & Co.`;
  }
};
