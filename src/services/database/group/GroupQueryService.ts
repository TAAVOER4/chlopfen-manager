
import { BaseGroupService } from './BaseGroupService';
import { Group } from '@/types';

export class GroupQueryService extends BaseGroupService {
  static async getAllGroups() {
    try {
      console.log("Getting all groups from database...");
      
      // Check if Supabase client is initialized using the inherited method
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
}
