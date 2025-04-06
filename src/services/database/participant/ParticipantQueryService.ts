
import { BaseParticipantService } from './BaseParticipantService';
import { Participant } from '@/types';

export class ParticipantQueryService extends BaseParticipantService {
  static async getAllParticipants() {
    try {
      const { data, error } = await this.supabase
        .from('participants')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) throw error;
      
      if (!data) return [];
      
      // Map the database column names to the frontend property names
      const transformedData = data.map(participant => ({
        id: participant.id,
        firstName: participant.first_name,
        lastName: participant.last_name,
        location: participant.location,
        birthYear: participant.birth_year,
        category: participant.category,
        isGroupOnly: participant.is_group_only || false,
        tournamentId: participant.tournament_id,
        displayOrder: participant.display_order,
        groupIds: [] // Will be populated later
      }));
      
      // Fetch group associations for all participants
      const { data: groupParticipants, error: groupError } = await this.supabase
        .from('group_participants')
        .select('*');
        
      if (!groupError && groupParticipants) {
        // Populate groupIds for each participant
        transformedData.forEach(participant => {
          participant.groupIds = groupParticipants
            .filter(gp => gp.participant_id === participant.id)
            .map(gp => gp.group_id);
        });
      }
      
      return transformedData as Participant[];
    } catch (error) {
      console.error('Error loading participants:', error);
      return [];
    }
  }
}
