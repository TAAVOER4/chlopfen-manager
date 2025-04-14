
import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';

export class GroupScoreService extends BaseScoreService {
  static async getGroupScores(): Promise<GroupScore[]> {
    try {
      const supabase = this.checkSupabaseClient();
      
      const { data, error } = await supabase
        .from('group_scores')
        .select('*');
        
      if (error) {
        console.error('Error fetching group scores:', error);
        throw new Error(`Error fetching group scores: ${error.message}`);
      }
      
      if (!data) return [];
      
      return data.map(score => ({
        id: score.id,
        groupId: score.group_id,
        judgeId: score.judge_id,
        whipStrikes: score.whip_strikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        tournamentId: score.tournament_id
      }));
    } catch (error) {
      console.error('Error in getGroupScores:', error);
      throw error;
    }
  }

  static async createGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    try {
      console.log('Creating group score:', score);
      
      // Validate inputs
      if (!score.groupId) {
        throw new Error('Group ID is required');
      }
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }
      
      // Check that judgeId is actually a string
      if (typeof score.judgeId !== 'string') {
        throw new Error('Judge ID must be a string in UUID format');
      }
      
      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      const supabase = this.checkSupabaseClient();
      
      // Log the judgeId for debugging
      console.log('Judge ID before saving:', score.judgeId, 'Type:', typeof score.judgeId);
      
      const { data, error } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: score.judgeId,
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
        throw new Error(`Error creating group score: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from score creation');
      }
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: data.judge_id,
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        tempo: data.tempo,
        time: data.time,
        tournamentId: data.tournament_id
      };
    } catch (error) {
      console.error('Error in createGroupScore:', error);
      throw error;
    }
  }

  static async updateGroupScore(score: GroupScore): Promise<GroupScore> {
    try {
      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Check that judgeId is actually a string
      if (typeof score.judgeId !== 'string') {
        throw new Error('Judge ID must be a string in UUID format');
      }
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }
      
      const supabase = this.checkSupabaseClient();
      
      const { data, error } = await supabase
        .from('group_scores')
        .update({
          group_id: score.groupId,
          judge_id: score.judgeId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: tournamentId
        })
        .eq('id', score.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating group score:', error);
        throw new Error(`Error updating group score: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from score update');
      }
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: data.judge_id,
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        tempo: data.tempo,
        time: data.time,
        tournamentId: data.tournament_id
      };
    } catch (error) {
      console.error('Error in updateGroupScore:', error);
      throw error;
    }
  }
}
