
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

  // Simplified method to get active scores
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
  
  // This method will be used directly to force archive all existing scores
  static async forceArchiveScores(groupId: number, judgeId: string, tournamentId: number): Promise<boolean> {
    try {
      console.log(`Force archiving scores for group ${groupId}, judge ${judgeId}, tournament ${tournamentId}`);
      
      // 1. Get all active scores
      const activeScores = await this.getActiveScoresForGroupAndJudge(groupId, judgeId, tournamentId);
      console.log(`Found ${activeScores.length} active scores to archive`);
      
      if (activeScores.length === 0) {
        console.log('No active scores to archive');
        return true; // Nothing to archive
      }
      
      // 2. Archive each score individually with delay between operations
      for (const score of activeScores) {
        console.log(`Archiving score ID: ${score.id}`);
        await this.archiveSingleScore(score.id);
        // Add a small delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 3. Verify all scores were archived
      const remainingScores = await this.getActiveScoresForGroupAndJudge(groupId, judgeId, tournamentId);
      
      if (remainingScores.length > 0) {
        console.error(`Failed to archive all scores. ${remainingScores.length} scores still active.`);
        
        // Try one last time with a direct DB call
        const supabase = this.checkSupabaseClient();
        const normalizedJudgeId = normalizeUuid(judgeId);
        
        const { error } = await supabase
          .from('group_scores')
          .update({ 
            record_type: 'H',
            modified_at: new Date().toISOString()
          })
          .eq('group_id', groupId)
          .eq('judge_id', normalizedJudgeId)
          .eq('tournament_id', tournamentId)
          .eq('record_type', 'C');
          
        if (error) {
          console.error('Error in final archive attempt:', error);
          return false;
        }
        
        // Final verification
        const finalCheck = await this.getActiveScoresForGroupAndJudge(groupId, judgeId, tournamentId);
        if (finalCheck.length > 0) {
          console.error(`Final archiving failed. ${finalCheck.length} scores still active.`);
          return false;
        }
      }
      
      console.log('Successfully archived all scores');
      return true;
    } catch (error) {
      console.error('Error in forceArchiveScores:', error);
      return false;
    }
  }
  
  static async archiveSingleScore(scoreId: number): Promise<boolean> {
    try {
      console.log(`Archiving single score with ID: ${scoreId}`);
      
      const supabase = this.checkSupabaseClient();
      
      // Archive a single score by ID
      const { error } = await supabase
        .from('group_scores')
        .update({
          record_type: 'H',
          modified_at: new Date().toISOString()
        })
        .eq('id', scoreId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error(`Error archiving score ${scoreId}:`, error);
        throw new Error(`Fehler beim Historisieren der Bewertung ID=${scoreId}: ${error.message}`);
      }
      
      // Verify the score was properly archived
      const { data, error: verifyError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('id', scoreId)
        .eq('record_type', 'C');
        
      if (verifyError) {
        console.error(`Error verifying score ${scoreId} archive:`, verifyError);
        return false;
      }
      
      if (data && data.length > 0) {
        console.error(`Failed to archive score ${scoreId}.`);
        return false;
      }
      
      console.log(`Successfully archived score ${scoreId}`);
      return true;
    } catch (error) {
      console.error(`Error in archiveSingleScore for ID ${scoreId}:`, error);
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
}
