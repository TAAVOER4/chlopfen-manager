
import { BaseService } from './BaseService';
import { Participant } from '@/types';

export class ParticipantService extends BaseService {
  static async getAllParticipants() {
    try {
      const { data, error } = await this.supabase
        .from('participants')
        .select('*');
        
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

  static async createParticipant(participant: Omit<Participant, 'id'>) {
    const { data, error } = await this.supabase
      .from('participants')
      .insert([{
        first_name: participant.firstName,
        last_name: participant.lastName,
        location: participant.location,
        birth_year: participant.birthYear,
        category: participant.category,
        is_group_only: participant.isGroupOnly || false,
        tournament_id: participant.tournamentId
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform the data back to the frontend format
    const newParticipant: Participant = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      location: data.location,
      birthYear: data.birth_year,
      category: data.category,
      isGroupOnly: data.is_group_only || false,
      tournamentId: data.tournament_id,
      groupIds: []
    };
    
    return newParticipant;
  }

  static async updateParticipant(participant: Participant) {
    const { data, error } = await this.supabase
      .from('participants')
      .update({
        first_name: participant.firstName,
        last_name: participant.lastName,
        location: participant.location,
        birth_year: participant.birthYear,
        category: participant.category,
        is_group_only: participant.isGroupOnly || false,
        tournament_id: participant.tournamentId
      })
      .eq('id', participant.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      location: data.location,
      birthYear: data.birth_year,
      category: data.category,
      isGroupOnly: data.is_group_only || false,
      tournamentId: data.tournament_id,
      groupIds: participant.groupIds
    } as Participant;
  }

  static async deleteParticipant(id: number) {
    const { error } = await this.supabase
      .from('participants')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  }

  // Update participant tournament assignments
  static async updateParticipantTournament(participantId: number, tournamentId: number | null) {
    const { error } = await this.supabase
      .from('participants')
      .update({ tournament_id: tournamentId })
      .eq('id', participantId);
      
    if (error) throw error;
    
    return true;
  }
  
  // Bulk update participant tournament assignments
  static async bulkUpdateParticipantTournaments(participantIds: number[], tournamentId: number | null) {
    if (participantIds.length === 0) return true;
    
    const { error } = await this.supabase
      .from('participants')
      .update({ tournament_id: tournamentId })
      .in('id', participantIds);
      
    if (error) throw error;
    
    return true;
  }
}
