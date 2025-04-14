
import { Participant, Group } from '../types';
import { supabase } from '@/lib/supabase';

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
export const isDuplicateGroup = async (
  participantIds: number[], 
  size: string,
  excludeGroupId?: number
): Promise<boolean> => {
  try {
    // Fetch all groups with the same size
    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, size')
      .eq('size', size);
      
    if (error) {
      console.error('Error checking for duplicate groups:', error);
      return false;
    }
    
    // Get group IDs
    const groupIds = groups
      .filter(g => g.id !== excludeGroupId)
      .map(g => g.id);
      
    if (groupIds.length === 0) {
      return false;
    }
    
    // Fetch group-participant relationships for these groups
    const { data: groupParticipants, error: relError } = await supabase
      .from('group_participants')
      .select('group_id, participant_id')
      .in('group_id', groupIds);
      
    if (relError) {
      console.error('Error checking group participants:', relError);
      return false;
    }
    
    // Group the participant IDs by group ID
    const participantsByGroup: Record<number, number[]> = {};
    
    groupParticipants.forEach(gp => {
      if (!participantsByGroup[gp.group_id]) {
        participantsByGroup[gp.group_id] = [];
      }
      participantsByGroup[gp.group_id].push(gp.participant_id);
    });
    
    // Check if any group has the exact same participants
    return Object.values(participantsByGroup).some(groupParticipantIds => {
      // Check if the group has the same number of participants
      if (groupParticipantIds.length !== participantIds.length) {
        return false;
      }
      
      // Check if all participantIds are in the group and vice versa
      const allParticipantsMatch = participantIds.every(id => 
        groupParticipantIds.includes(id)
      );
      
      const allGroupParticipantsMatch = groupParticipantIds.every(id => 
        participantIds.includes(id)
      );
      
      return allParticipantsMatch && allGroupParticipantsMatch;
    });
  } catch (error) {
    console.error('Error in isDuplicateGroup:', error);
    return false;
  }
};
