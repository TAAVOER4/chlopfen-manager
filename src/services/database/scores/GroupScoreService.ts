
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

  static async createOrUpdateGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    try {
      console.log('Creating or updating group score:', score);
      
      ScoreValidationService.validateScoreData(score);
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }

      const originalJudgeId = String(score.judgeId);
      
      // Ensure numeric fields have values
      const whipStrikes = score.whipStrikes ?? 0;
      const rhythm = score.rhythm ?? 0;
      const tempo = score.tempo ?? 0;
      
      // Handle admin users
      if (isAdminId(originalJudgeId)) {
        console.log('Admin user detected, getting valid judge ID');
        const validJudgeId = await GroupScoreDbService.getValidJudgeId();
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, validJudgeId, originalJudgeId);
      }
      
      // Regular judge case - use normalized UUID
      console.log('Regular judge case, normalizing UUID');
      const normalizedJudgeId = normalizeUuid(originalJudgeId);
      return await this.createNewScore({
        ...score,
        whipStrikes,
        rhythm,
        tempo
      }, normalizedJudgeId, originalJudgeId);
      
    } catch (error) {
      console.error('Error in createOrUpdateGroupScore:', error);
      throw error;
    }
  }
  
  private static async createNewScore(
    score: Omit<GroupScore, 'id'>, 
    dbJudgeId: string, 
    originalJudgeId: string
  ): Promise<GroupScore> {
    try {
      console.log('Creating new score with judge ID:', dbJudgeId);
      const data = await GroupScoreDbService.createScore(score, dbJudgeId, originalJudgeId);
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: originalJudgeId,
        whipStrikes: data.whip_strikes,
        rhythm: data.rhythm,
        tempo: data.tempo,
        time: data.time,
        tournamentId: data.tournament_id
      };
    } catch (error) {
      console.error('Error creating new score:', error);
      throw error;
    }
  }

  static async createGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    return this.createOrUpdateGroupScore(score);
  }

  static async updateGroupScore(score: GroupScore): Promise<GroupScore> {
    return this.createOrUpdateGroupScore(score);
  }
  
  static async forceArchiveScores(groupId: number, judgeId: string, tournamentId: number): Promise<boolean> {
    try {
      console.log(`Force archiving scores for group ${groupId}, judge ${judgeId}, tournament ${tournamentId}`);
      
      // Direct database approach to archive scores
      const normalizedJudgeId = normalizeUuid(judgeId);
      
      // 1. First check if there are any active scores that need archiving
      const { data: activeScores, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (checkError) {
        console.error('Error checking for active scores:', checkError);
        throw new Error(`Error checking active scores: ${checkError.message}`);
      }
      
      if (!activeScores || activeScores.length === 0) {
        console.log('No active scores found to archive.');
        return true; // Nothing to archive, so we succeeded
      }
      
      console.log(`Found ${activeScores.length} active scores to archive.`);
      
      // 2. Archive all active scores using UPDATE
      const { error: archiveError } = await supabase
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
        
      if (archiveError) {
        console.error('Error archiving scores:', archiveError);
        throw new Error(`Fehler beim Historisieren: ${archiveError.message}`);
      }
      
      // 3. Verify that all records were archived
      const { data: remainingActiveScores, error: verifyError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (verifyError) {
        console.error('Error verifying archive operation:', verifyError);
        throw new Error(`Error verifying archive: ${verifyError.message}`);
      }
      
      if (remainingActiveScores && remainingActiveScores.length > 0) {
        console.error(`Failed to archive all scores. ${remainingActiveScores.length} still active.`);
        throw new Error('Die vorhandenen Bewertungen konnten nicht vollständig historisiert werden.');
      }
      
      console.log('Successfully archived all scores');
      return true;
    } catch (error) {
      console.error('Error in forceArchiveScores:', error);
      throw error;
    }
  }
}
