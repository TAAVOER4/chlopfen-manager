import { BaseService } from './BaseService';
import { IndividualScore, GroupScore } from '@/types';

export class ScoreService extends BaseService {
  static async getIndividualScores(): Promise<IndividualScore[]> {
    try {
      const { data, error } = await this.supabase
        .from('individual_scores')
        .select('*');
        
      if (error) {
        console.error('Error fetching individual scores:', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Transform the data from database format to frontend format
      return data.map(score => ({
        id: score.id,
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
    } catch (error) {
      console.error('Error loading individual scores:', error);
      return [];
    }
  }
  
  static async getGroupScores(): Promise<GroupScore[]> {
    try {
      const { data, error } = await this.supabase
        .from('group_scores')
        .select('*');
        
      if (error) {
        console.error('Error fetching group scores:', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Transform the data from database format to frontend format
      return data.map(score => ({
        id: score.id,
        groupId: score.group_id,
        judgeId: score.judge_id,
        whipStrikes: score.whip_strikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        tournamentId: score.tournament_id
      })) as GroupScore[];
    } catch (error) {
      console.error('Error loading group scores:', error);
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
        
      if (error) {
        console.error('Error creating individual score:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from score creation');
      }
      
      // Transform the data back to the frontend format
      return {
        id: data.id,
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
    } catch (error) {
      console.error('Error creating individual score:', error);
      throw error;
    }
  }
  
  static async createGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    try {
      console.log('Saving group score with data:', score);
      
      // Ensure tournamentId is a number before sending to database
      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Handle the judgeId appropriately based on its type
      // If it's a string that can be parsed as a number, do so
      // Otherwise, use it as is (the database expects a UUID as string)
      let judgeId = score.judgeId;
      if (typeof judgeId === 'string' && !isNaN(Number(judgeId))) {
        // If it's a numeric string, convert to number for GroupScore type compatibility
        judgeId = parseInt(judgeId, 10);
      }
      
      if (!judgeId) {
        throw new Error('Judge ID is required');
      }
      
      console.log('Processing score submission with judge ID:', judgeId, 'Type:', typeof judgeId);
        
      const { data, error } = await this.supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: judgeId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: tournamentId
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating group score:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from score creation');
      }
      
      // Transform the data back to the frontend format
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: data.judge_id,
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        tempo: data.tempo,
        time: data.time,
        tournamentId: data.tournament_id
      } as GroupScore;
    } catch (error) {
      console.error('Error creating group score:', error);
      throw error;
    }
  }
}
