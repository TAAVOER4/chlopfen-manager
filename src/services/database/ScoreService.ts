
import { BaseService } from './BaseService';
import { IndividualScore, GroupScore } from '@/types';

export class ScoreService extends BaseService {
  // Individual Scores
  static async getIndividualScores() {
    const { data, error } = await this.supabase
      .from('individual_scores')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Map to the frontend model
    return data.map(score => ({
      participantId: score.participant_id,
      judgeId: score.judge_id,
      round: score.round,
      whipStrikes: score.whip_strikes,
      rhythm: score.rhythm,
      stance: score.stance,
      posture: score.posture,
      whipControl: score.whip_control,
      tournamentId: score.tournament_id
    })) as IndividualScore[];
  }

  static async createIndividualScore(score: IndividualScore) {
    const { data, error } = await this.supabase
      .from('individual_scores')
      .insert([{
        participant_id: score.participantId,
        judge_id: score.judgeId,
        round: score.round,
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        stance: score.stance,
        posture: score.posture,
        whip_control: score.whipControl,
        tournament_id: score.tournamentId
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      participantId: data.participant_id,
      judgeId: data.judge_id,
      round: data.round,
      whipStrikes: data.whip_strikes,
      rhythm: data.rhythm,
      stance: data.stance,
      posture: data.posture,
      whipControl: data.whip_control,
      tournamentId: data.tournament_id
    } as IndividualScore;
  }

  // Group Scores
  static async getGroupScores() {
    const { data, error } = await this.supabase
      .from('group_scores')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Map to the frontend model
    return data.map(score => ({
      groupId: score.group_id,
      judgeId: score.judge_id,
      whipStrikes: score.whip_strikes,
      rhythm: score.rhythm,
      tempo: score.tempo,
      time: score.time,
      tournamentId: score.tournament_id
    })) as GroupScore[];
  }

  static async createGroupScore(score: GroupScore) {
    const { data, error } = await this.supabase
      .from('group_scores')
      .insert([{
        group_id: score.groupId,
        judge_id: score.judgeId,
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        tournament_id: score.tournamentId
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      groupId: data.group_id,
      judgeId: data.judge_id,
      whipStrikes: data.whip_strikes,
      rhythm: data.rhythm,
      tempo: data.tempo,
      time: data.time,
      tournamentId: data.tournament_id
    } as GroupScore;
  }
}
