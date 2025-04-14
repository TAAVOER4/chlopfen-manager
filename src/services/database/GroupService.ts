
import { BaseService } from './BaseService';
import { Group } from '@/types';

export class GroupService extends BaseService {
  static async getAllGroups() {
    try {
      console.log("Getting all groups from database...");
      
      // Check if Supabase client is initialized
      const supabase = this.checkSupabaseClient();
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error loading groups:', error);
        return [];
      }
      
      if (!data) return [];
      
      console.log("Database returned groups data:", data.length, "records");
      
      // Create a list of all group IDs to fetch participant relationships
      const groupIds = data.map(group => group.id);
      
      // Map the database column names to the frontend property names
      const transformedData = data.map(group => ({
        id: group.id,
        name: group.name,
        category: group.category,
        size: group.size,
        tournamentId: group.tournament_id,
        displayOrder: group.display_order,
        participantIds: [] // Will be populated below
      }));
      
      // If there are no groups, return empty array
      if (groupIds.length === 0) return transformedData;
      
      // Fetch all group-participant relationships for the groups
      const { data: groupParticipants, error: relError } = await supabase
        .from('group_participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (relError) {
        console.error('Error loading group-participant relationships:', relError);
      } else if (groupParticipants) {
        // Populate participantIds for each group
        transformedData.forEach(group => {
          group.participantIds = groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id);
        });
      }
      
      console.log("Processed groups with participants:", transformedData.length);
      return transformedData as Group[];
    } catch (error) {
      console.error('Error in getAllGroups method:', error);
      return [];
    }
  }

  static async createGroup(group: Omit<Group, 'id'>) {
    try {
      const supabase = this.checkSupabaseClient();
      
      // Create the group
      const { data, error } = await supabase
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
        
      if (error) {
        this.handleError(error, 'creating group');
      }
      
      if (!data) {
        throw new Error('No data returned from group creation');
      }
      
      const newGroup: Group = {
        id: data.id,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order,
        participantIds: group.participantIds || []
      };
      
      // If there are participants to associate, create those relationships
      if (group.participantIds && group.participantIds.length > 0) {
        const participantInserts = group.participantIds.map(participantId => ({
          group_id: newGroup.id,
          participant_id: participantId
        }));
        
        const { error: relError } = await supabase
          .from('group_participants')
          .insert(participantInserts);
          
        if (relError) {
          console.error('Error creating group-participant relationships:', relError);
        }
      }
      
      return newGroup;
    } catch (error) {
      this.handleError(error, 'creating group');
      throw error;
    }
  }

  static async updateGroup(group: Group) {
    try {
      const supabase = this.checkSupabaseClient();
      
      // Update the group
      const { data, error } = await supabase
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
        
      if (error) {
        this.handleError(error, 'updating group');
      }
      
      if (!data) {
        throw new Error('No data returned from group update');
      }
      
      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) {
        console.error('Error deleting group-participant relationships:', deleteError);
      }
      
      // Create new relationships if needed
      if (group.participantIds && group.participantIds.length > 0) {
        const participantInserts = group.participantIds.map(participantId => ({
          group_id: group.id,
          participant_id: participantId
        }));
        
        const { error: insertError } = await supabase
          .from('group_participants')
          .insert(participantInserts);
          
        if (insertError) {
          console.error('Error creating group-participant relationships:', insertError);
        }
      }
      
      return {
        ...group,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order
      };
    } catch (error) {
      this.handleError(error, 'updating group');
      throw error;
    }
  }

  static async deleteGroup(groupId: number) {
    try {
      const supabase = this.checkSupabaseClient();
      
      // First delete all group-participant relationships
      const { error: relError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', groupId);
        
      if (relError) {
        console.error('Error deleting group-participant relationships:', relError);
      }
      
      // Then delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
        
      if (error) {
        this.handleError(error, 'deleting group');
      }
      
      return true;
    } catch (error) {
      this.handleError(error, 'deleting group');
      throw error;
    }
  }

  static async updateGroupDisplayOrder(groupId: number, displayOrder: number) {
    try {
      const supabase = this.checkSupabaseClient();
      
      const { error } = await supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', groupId);
        
      if (error) {
        this.handleError(error, 'updating group display order');
      }
      
      return true;
    } catch (error) {
      this.handleError(error, 'updating group display order');
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(updates: { id: number; displayOrder: number }[]) {
    try {
      const supabase = this.checkSupabaseClient();
      
      // We need to execute these updates sequentially to avoid conflicts
      for (const update of updates) {
        const { error } = await supabase
          .from('groups')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id);
          
        if (error) {
          console.error(`Error updating display order for group ${update.id}:`, error);
        }
      }
      
      return true;
    } catch (error) {
      this.handleError(error, 'bulk updating group display orders');
      throw error;
    }
  }
}
