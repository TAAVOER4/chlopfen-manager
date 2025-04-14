
import { IndividualScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';

export class IndividualScoreService extends BaseScoreService {
  static async getIndividualScores(): Promise<IndividualScore[]> {
    try {
      const { data, error } = await this.supabase
        .from('individual_scores')
        .select('*');
        
      if (error) {
        this.handleError(error, 'fetching individual scores');
      }
      
      if (!data) return [];
      
      return data.map(score => ({
        id: score.id,
        participantId: score.participant_id,
        judgeId: score.judge_id,
        round: score.round === 2 ? 2 : 1, // Ensure round is strictly 1 or 2
        whipStrikes: score.whip_strikes,
        rhythm: score.rhythm,
        stance: score.stance,
        posture: score.posture,
        whipControl: score.whip_control,
        tournamentId: score.tournament_id
      }));
    } catch (error) {
      return [];
    }
  }

  static async createIndividualScore(score: Omit<IndividualScore, 'id'>): Promise<IndividualScore> {
    try {
      const { data, error } = await this.supabase
        .from('individual_scores')
        .insert([{
          participant_id: score.participantId,
          judge_id: score.judgeId,
          round: score.round, // This is already 1 or 2 from the input type
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          stance: score.stance,
          posture: score.posture,
          whip_control: score.whipControl,
          tournament_id: score.tournamentId
        }])
        .select()
        .single();
        
      if (error) {
        this.handleError(error, 'creating individual score');
      }
      
      if (!data) {
        throw new Error('No data returned from score creation');
      }
      
      return {
        id: data.id,
        participantId: data.participant_id,
        judgeId: data.judge_id,
        round: data.round === 2 ? 2 : 1, // Ensure round is strictly 1 or 2
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        stance: data.stance,
        posture: data.posture,
        whipControl: data.whip_control,
        tournamentId: data.tournament_id
      };
    } catch (error) {
      this.handleError(error, 'creating individual score');
    }
  }

  static async updateIndividualScore(score: IndividualScore): Promise<IndividualScore> {
    try {
      const { data, error } = await this.supabase
        .from('individual_scores')
        .update({
          participant_id: score.participantId,
          judge_id: score.judgeId,
          round: score.round, // This is already 1 or 2 from the input type
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          stance: score.stance,
          posture: score.posture,
          whip_control: score.whipControl,
          tournament_id: score.tournamentId
        })
        .eq('id', score.id)
        .select()
        .single();
        
      if (error) {
        this.handleError(error, 'updating individual score');
      }
      
      if (!data) {
        throw new Error('No data returned from score update');
      }
      
      return {
        id: data.id,
        participantId: data.participant_id,
        judgeId: data.judge_id,
        round: data.round === 2 ? 2 : 1, // Ensure round is strictly 1 or 2
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        stance: data.stance,
        posture: data.posture,
        whipControl: data.whip_control,
        tournamentId: data.tournament_id
      };
    } catch (error) {
      this.handleError(error, 'updating individual score');
    }
  }
}
