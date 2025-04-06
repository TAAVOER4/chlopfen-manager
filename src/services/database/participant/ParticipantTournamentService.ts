
import { BaseParticipantService } from './BaseParticipantService';

export class ParticipantTournamentService extends BaseParticipantService {
  static async updateParticipantTournament(participantId: number, tournamentId: number | null) {
    try {
      const { error } = await this.supabase
        .from('participants')
        .update({ tournament_id: tournamentId })
        .eq('id', participantId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating participant tournament:', error);
      throw error;
    }
  }

  static async bulkUpdateParticipantTournaments(participantIds: number[], tournamentId: number | null) {
    try {
      if (participantIds.length === 0) return true;
      
      const { error } = await this.supabase
        .from('participants')
        .update({ tournament_id: tournamentId })
        .in('id', participantIds);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error bulk updating participant tournaments:', error);
      throw error;
    }
  }
}
