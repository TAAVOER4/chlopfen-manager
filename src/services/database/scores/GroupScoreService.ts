import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';
import { ScoreValidationService } from './ScoreValidationService';
import { GroupScoreDbService } from './GroupScoreDbService';
import { isAdminId, normalizeUuid } from './utils/ValidationUtils';
import { supabase } from '@/lib/supabase';

export class GroupScoreService extends BaseScoreService {
  static async getGroupScores(): Promise<GroupScore[]> {
    try {
      const supabase = this.checkSupabaseClient();
      
      const { data, error } = await supabase
        .from('group_scores')
        .select('*')
        .eq('record_type', 'C');
        
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

  // Get active scores for a specific group and judge
  static async getActiveScoresForGroupAndJudge(
    groupId: number, 
    judgeId: string, 
    tournamentId: number
  ): Promise<{id: number, groupId: number, judgeId: string}[]> {
    try {
      console.log(`Checking for active scores for group ${groupId}, judge ${judgeId}`);
      
      const supabase = this.checkSupabaseClient();
      const normalizedJudgeId = normalizeUuid(judgeId);
      
      const { data, error } = await supabase
        .from('group_scores')
        .select('id, group_id, judge_id')
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error checking for active scores:', error);
        throw new Error(`Error checking active scores: ${error.message}`);
      }
      
      console.log(`Found ${data?.length || 0} active scores`);
      
      if (!data) return [];
      
      return data.map(score => ({
        id: score.id,
        groupId: score.group_id,
        judgeId: score.judge_id
      }));
    } catch (error) {
      console.error('Error in getActiveScoresForGroupAndJudge:', error);
      throw error;
    }
  }

  static async forceArchiveScores(groupId: number, judgeId: string, tournamentId: number): Promise<boolean> {
    try {
      const supabase = this.checkSupabaseClient();
      const normalizedJudgeId = normalizeUuid(judgeId);
      
      console.log(`Archiving scores for group ${groupId}, judge ${normalizedJudgeId}`);
      
      // Direct update to archive existing scores
      const { error } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString(),
          modified_by: normalizedJudgeId
        })
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error archiving scores:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in forceArchiveScores:', error);
      return false;
    }
  }

  static async createGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    try {
      console.log('Creating new group score:', score);
      
      ScoreValidationService.validateScoreData(score);
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }

      const originalJudgeId = String(score.judgeId);
      const normalizedJudgeId = normalizeUuid(originalJudgeId);
      
      const supabase = this.checkSupabaseClient();

      // Create new current record
      const { data: newScore, error: insertError } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: normalizedJudgeId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_by: normalizedJudgeId,
          modified_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating new group score:', insertError);
        throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${insertError.message}`);
      }
      
      console.log('Successfully created new score:', newScore);
      
      return {
        id: newScore.id,
        groupId: newScore.group_id,
        judgeId: originalJudgeId,
        whipStrikes: newScore.whip_strikes,
        rhythm: newScore.rhythm,
        tempo: newScore.tempo,
        time: newScore.time,
        tournamentId: newScore.tournament_id
      };
    } catch (error) {
      console.error('Error in createGroupScore:', error);
      throw error;
    }
  }
}
