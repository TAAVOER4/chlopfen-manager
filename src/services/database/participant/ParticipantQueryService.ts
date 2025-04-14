
import { BaseParticipantService } from './BaseParticipantService';
import { Participant } from '@/types';

export class ParticipantQueryService extends BaseParticipantService {
  static async getAllParticipants() {
    try {
      console.log("Getting all participants from database...");
      
      if (!this.supabase) {
        console.error('Supabase client is not initialized in ParticipantQueryService');
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await this.supabase
        .from('participants')
        .select('*')
        .eq('record_type', 'C')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error loading participants:', error);
        return [];
      }
      
      if (!data) return [];
      
      console.log("Database returned participants data:", data.length, "records");
      
      // Create a list of all participant IDs to fetch group relationships
      const participantIds = data.map(participant => participant.id);
      
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
        groupIds: [] // Will be populated below
      })) as Participant[];
      
      // If there are no participants, return empty array
      if (participantIds.length === 0) return transformedData;
      
      // Fetch all group-participant relationships for the participants
      const { data: groupParticipants, error: relError } = await this.supabase
        .from('group_participants')
        .select('*')
        .eq('record_type', 'C')
        .in('participant_id', participantIds);
        
      if (relError) {
        console.error('Error loading group-participant relationships:', relError);
      } else if (groupParticipants) {
        // Populate groupIds for each participant
        transformedData.forEach(participant => {
          participant.groupIds = groupParticipants
            .filter(gp => gp.participant_id === participant.id)
            .map(gp => gp.group_id);
        });
      }
      
      console.log("Processed participants with groups:", transformedData.length);
      return transformedData;
    } catch (error) {
      console.error('Error in getAllParticipants method:', error);
      return [];
    }
  }
}
