
import { BaseGroupService } from './BaseGroupService';
import { Group, GroupSize, GroupCategory } from '@/types';

export class GroupMutationService extends BaseGroupService {
  static async createGroup(group: Omit<Group, 'id'>) {
    try {
      // First insert the group
      const { data, error } = await this.supabase
        .from('groups')
        .insert({
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId,
          display_order: group.displayOrder
        })
        .select('id')
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('No data returned from group insert');
      
      const groupId = data.id;
      
      // Then add all participant associations
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: groupId,
          participant_id: participantId
        }));
        
        const { error: assocError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (assocError) throw assocError;
      }
      
      return { ...group, id: groupId };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async updateGroup(id: number, group: Partial<Omit<Group, 'id'>>) {
    try {
      // Update group info
      const { error } = await this.supabase
        .from('groups')
        .update({
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId,
          display_order: group.displayOrder
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // If participantIds are provided, update associations
      if (group.participantIds) {
        // First delete all existing associations
        const { error: deleteError } = await this.supabase
          .from('group_participants')
          .delete()
          .eq('group_id', id);
          
        if (deleteError) throw deleteError;
        
        // Then add new associations
        if (group.participantIds.length > 0) {
          const groupParticipants = group.participantIds.map(participantId => ({
            group_id: id,
            participant_id: participantId
          }));
          
          const { error: insertError } = await this.supabase
            .from('group_participants')
            .insert(groupParticipants);
            
          if (insertError) throw insertError;
        }
      }
      
      return { id, ...group };
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(id: number) {
    try {
      // First delete all participant associations
      const { error: assocError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', id);
        
      if (assocError) throw assocError;
      
      // Then delete the group
      const { error } = await this.supabase
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
}
