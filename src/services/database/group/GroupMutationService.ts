
import { BaseGroupService } from './BaseGroupService';
import { Group } from '@/types';

export class GroupMutationService extends BaseGroupService {
  static async createGroup(group: Omit<Group, 'id'>) {
    try {
      console.log("Creating group in database:", group);
      
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
        
      if (error) {
        console.error("Error inserting group:", error);
        throw error;
      }
      
      console.log("Group created successfully:", data);
      const newGroupId = data.id;
      
      // Now add participants to the group
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: newGroupId,
          participant_id: participantId
        }));
        
        console.log("Adding participants to group:", groupParticipants);
        const { error: participantError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (participantError) {
          console.error("Error adding participants to group:", participantError);
          throw participantError;
        }
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
      console.log("Updating group in database:", group);
      
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
        
      if (error) {
        console.error("Error updating group:", error);
        throw error;
      }
      
      // Delete all existing participant associations
      const { error: deleteError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) {
        console.error("Error deleting group participants:", deleteError);
        throw deleteError;
      }
      
      // Create new participant associations
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: group.id,
          participant_id: participantId
        }));
        
        console.log("Adding updated participants to group:", groupParticipants);
        const { error: insertError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (insertError) {
          console.error("Error inserting updated group participants:", insertError);
          throw insertError;
        }
      }
      
      console.log("Group updated successfully:", group);
      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(id: number) {
    try {
      console.log("Deleting group with ID:", id);
      
      // Delete group participants associations first
      const { error: deleteParticipantsError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', id);
        
      if (deleteParticipantsError) {
        console.error("Error deleting group participants:", deleteParticipantsError);
        throw deleteParticipantsError;
      }
      
      // Then delete the group
      const { error } = await this.supabase
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting group:", error);
        throw error;
      }
      
      console.log("Group deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
}
