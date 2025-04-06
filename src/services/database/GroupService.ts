import { BaseService } from './BaseService';
import { Group } from '@/types';
import { supabase } from '@/lib/supabase'; // Direct import as fallback

export class GroupService extends BaseService {
  static async getAllGroups() {
    try {
      console.log("Getting all groups...");
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true, nullsLast: true });
        
      if (error) throw error;
      
      if (!data) return [];
      
      // Create initial groups without participants
      const groups = data.map(group => ({
        id: group.id,
        name: group.name,
        category: group.category,
        size: group.size,
        tournamentId: group.tournament_id,
        displayOrder: group.display_order,
        participantIds: [] as number[]
      }));
      
      // Fetch group-participant associations
      const { data: groupParticipants, error: groupError } = await supabase
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
      console.log("Creating group in database:", group);
      
      // First create the group
      const { data, error } = await supabase
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
        const { error: participantError } = await supabase
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
      const { error } = await supabase
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
      const { error: deleteError } = await supabase
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
        const { error: insertError } = await supabase
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
      const { error: deleteParticipantsError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', id);
        
      if (deleteParticipantsError) {
        console.error("Error deleting group participants:", deleteParticipantsError);
        throw deleteParticipantsError;
      }
      
      // Then delete the group
      const { error } = await supabase
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

  static async updateGroupDisplayOrder(groupId: number, displayOrder: number) {
    try {
      console.log(`Updating display order for group ${groupId} to ${displayOrder}`);
      
      const { error } = await supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', groupId);
        
      if (error) {
        console.error("Error updating group display order:", error);
        throw error;
      }
      
      console.log("Group display order updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating group display order:', error);
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(groupUpdates: { id: number, displayOrder: number }[]) {
    try {
      if (groupUpdates.length === 0) return true;
      
      console.log("Bulk updating group display orders:", groupUpdates);
      
      // Create an array of updates for the database
      const updates = groupUpdates.map(update => ({
        id: update.id,
        display_order: update.displayOrder
      }));
      
      const { error } = await supabase
        .from('groups')
        .upsert(updates, { onConflict: 'id' });
        
      if (error) {
        console.error("Error bulk updating group display orders:", error);
        throw error;
      }
      
      console.log("Bulk update of group display orders completed successfully");
      return true;
    } catch (error) {
      console.error('Error bulk updating group display orders:', error);
      throw error;
    }
  }
}
