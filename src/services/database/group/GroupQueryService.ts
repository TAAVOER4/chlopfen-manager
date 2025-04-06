
import { BaseGroupService } from './BaseGroupService';
import { Group } from '@/types';

export class GroupQueryService extends BaseGroupService {
  static async getAllGroups() {
    try {
      console.log("Getting all groups...");
      
      const { data, error } = await this.supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error loading groups:', error);
        throw error;
      }
      
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
      const { data: groupParticipants, error: groupError } = await this.supabase
        .from('group_participants')
        .select('*');
        
      if (groupError) {
        console.error('Error loading group participants:', groupError);
      }
      
      if (groupParticipants) {
        // Add participant IDs to each group
        groups.forEach(group => {
          group.participantIds = groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id);
        });
      }
      
      console.log("Loaded groups:", groups);
      return groups as Group[];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }
}
