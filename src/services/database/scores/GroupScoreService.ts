
import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';
import { ScoreValidationService } from './ScoreValidationService';
import { GroupScoreDbService } from './GroupScoreDbService';
import { isAdminId, normalizeUuid, getDatabaseJudgeId } from './utils/ValidationUtils';

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

  static async createOrUpdateGroupScore(score: Omit<GroupScore, 'id'>, isRetry: boolean = false): Promise<GroupScore> {
    try {
      console.log('Creating or updating group score:', score, 'Is retry:', isRetry);
      
      // Validate inputs
      ScoreValidationService.validateScoreData(score);
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }
      
      // Track the original judge ID for response formatting and modified_by tracking
      const originalJudgeId = String(score.judgeId);
      
      // Get the tournament ID as a number
      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Ensure numeric fields have values or defaults
      const whipStrikes = score.whipStrikes === null ? 0 : score.whipStrikes;
      const rhythm = score.rhythm === null ? 0 : score.rhythm;
      const tempo = score.tempo === null ? 0 : score.tempo;
      
      // Force archive any existing scores for this combination
      await GroupScoreDbService.forceArchiveExistingScores(
        score.groupId, 
        originalJudgeId, 
        tournamentId
      );
      
      // If it's an admin creating a score, use a valid judge ID for database constraints
      if (isAdminId(originalJudgeId)) {
        console.log('Admin user detected with ID:', originalJudgeId);
        const validJudgeId = await GroupScoreDbService.getValidJudgeId();
        console.log('Using judge ID for admin submission:', validJudgeId);
        
        // For admin users, we use a valid judge ID in DB, but track the admin's ID as modified_by
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, validJudgeId, originalJudgeId);
      } else {
        // Regular judge case - use the normalized UUID
        const normalizedJudgeId = normalizeUuid(originalJudgeId);
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, normalizedJudgeId, originalJudgeId);
      }
    } catch (error) {
      console.error('Error in createOrUpdateGroupScore:', error);
      throw error;
    }
  }
  
  // Helper method to create a new score and handle the response formatting
  private static async createNewScore(
    score: Omit<GroupScore, 'id'>, 
    dbJudgeId: string, 
    originalJudgeId: string
  ): Promise<GroupScore> {
    try {
      // Create the new score with improved error handling - pass the original judgeId as userId for modified_by
      const data = await GroupScoreDbService.createScore(score, dbJudgeId, originalJudgeId);
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: originalJudgeId, // Use original ID for UI if provided
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
