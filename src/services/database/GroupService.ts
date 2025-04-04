
import { BaseService } from './BaseService';
import { Group } from '@/types';

export class GroupService extends BaseService {
  static async getAllGroups() {
    try {
      const { data, error } = await this.supabase
        .from('groups')
        .select('*');
        
      if (error) throw error;
      
      if (!data) return [];
      
      // Create initial groups without participants
      const groups = data.map(group => ({
        id: group.id,
        name: group.name,
        category: group.category,
        size: group.size,
        tournamentId: group.tournament_id,
        participantIds: [] as number[]
      }));
      
      // Fetch group-participant associations
      const { data: groupParticipants, error: groupError } = await this.supabase
        .from('group_participants')
        .select('*');
        
      if (!groupError && groupParticipants) {
        // Add participant IDs to each group
        groups.forEach(group => {
          group.participantIds = groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id);
        });
      }
      
      return groups as Group[];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  static async createGroup(group: Omit<Group, 'id'>) {
    try {
      // First create the group
      const { data, error } = await this.supabase
        .from('groups')
        .insert([{
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newGroupId = data.id;
      
      // Now add participants to the group
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: newGroupId,
          participant_id: participantId
        }));
        
        const { error: participantError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (participantError) throw participantError;
      }
      
      // Return the new group with participants
      return {
        id: newGroupId,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        participantIds: group.participantIds
      } as Group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async updateGroup(group: Group) {
    try {
      // Update the group details
      const { error } = await this.supabase
        .from('groups')
        .update({
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId
        })
        .eq('id', group.id);
        
      if (error) throw error;
      
      // Delete all existing participant associations
      const { error: deleteError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) throw deleteError;
      
      // Create new participant associations
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: group.id,
          participant_id: participantId
        }));
        
        const { error: insertError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (insertError) throw insertError;
      }
      
      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(id: number) {
    // Delete group participants associations first
    const { error: deleteParticipantsError } = await this.supabase
      .from('group_participants')
      .delete()
      .eq('group_id', id);
      
    if (deleteParticipantsError) throw deleteParticipantsError;
    
    // Then delete the group
    const { error } = await this.supabase
      .from('groups')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  }
}
