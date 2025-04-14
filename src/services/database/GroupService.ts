
import { BaseService } from './BaseService';
import { Group } from '@/types';

export class GroupService extends BaseService {
  static async getAllGroups(): Promise<Group[]> {
    try {
      console.log("Getting all groups from database...");
      
      if (!this.supabase) {
        console.error('Supabase client is not initialized');
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await this.supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error loading groups:', error);
        throw error;
      }
      
      if (!data) return [];
      
      console.log("Database returned groups data:", data.length, "records");
      
      // Transform the data to the frontend format
      const transformedData = await Promise.all(data.map(async (group) => {
        // Get participant IDs for this group
        const { data: groupParticipants, error: participantsError } = await this.supabase
          .from('group_participants')
          .select('participant_id')
          .eq('group_id', group.id);
          
        if (participantsError) {
          console.error('Error loading group participants:', participantsError);
        }
        
        const participantIds = groupParticipants ? 
          groupParticipants.map(gp => gp.participant_id) : [];
          
        return {
          id: group.id,
          name: group.name,
          category: group.category,
          size: group.size,
          tournamentId: group.tournament_id,
          displayOrder: group.display_order,
          participantIds
        };
      }));
      
      console.log("Processed groups with participants:", transformedData.length);
      return transformedData as Group[];
    } catch (error) {
      console.error('Error in getAllGroups method:', error);
      return [];
    }
  }

  static async createGroup(group: Omit<Group, 'id'>): Promise<Group> {
    try {
      const { data, error } = await this.supabase
        .from('groups')
        .insert([{
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId,
          display_order: group.displayOrder
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from group creation');
      
      // Insert group participants
      if (group.participantIds && group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: data.id,
          participant_id: participantId
        }));
        
        const { error: participantsError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (participantsError) {
          console.error('Error adding participants to group:', participantsError);
        }
      }
      
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order,
        participantIds: group.participantIds || []
      } as Group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async updateGroup(group: Group): Promise<Group> {
    try {
      const { data, error } = await this.supabase
        .from('groups')
        .update({
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId,
          display_order: group.displayOrder
        })
        .eq('id', group.id)
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from group update');
      
      // Update group participants (first delete all existing, then insert new)
      const { error: deleteError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) {
        console.error('Error removing participants from group:', deleteError);
      }
      
      // Insert new participants
      if (group.participantIds && group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: group.id,
          participant_id: participantId
        }));
        
        const { error: participantsError } = await this.supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (participantsError) {
          console.error('Error adding participants to group:', participantsError);
        }
      }
      
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order,
        participantIds: group.participantIds || []
      } as Group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(id: number): Promise<boolean> {
    try {
      // First delete all group participants
      const { error: participantsError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('group_id', id);
        
      if (participantsError) {
        console.error('Error removing participants from group:', participantsError);
      }
      
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

  static async updateGroupDisplayOrder(id: number, displayOrder: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating group display order:', error);
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(groups: { id: number; displayOrder: number }[]): Promise<boolean> {
    try {
      // Execute in sequence to avoid conflicts
      for (const group of groups) {
        await this.updateGroupDisplayOrder(group.id, group.displayOrder);
      }
      
      return true;
    } catch (error) {
      console.error('Error bulk updating group display orders:', error);
      throw error;
    }
  }
}
