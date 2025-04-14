
import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';
import { ScoreValidationService } from './ScoreValidationService';
import { GroupScoreDbService } from './GroupScoreDbService';
import { isAdminId, normalizeUuid } from './utils/ValidationUtils';

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
      
      // Normalize judgeId to ensure it's in the correct format for database operations
      const originalJudgeId = String(score.judgeId);
      const normalizedJudgeId = normalizeUuid(originalJudgeId);
      
      console.log('Judge ID conversion:', {
        original: originalJudgeId,
        normalized: normalizedJudgeId
      });
      
      // Ensure numeric fields have values or defaults
      const whipStrikes = score.whipStrikes === null ? 0 : score.whipStrikes;
      const rhythm = score.rhythm === null ? 0 : score.rhythm;
      const tempo = score.tempo === null ? 0 : score.tempo;

      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Use a more aggressive clean-up approach on retry
      if (isRetry) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await GroupScoreDbService.forceArchiveExistingScores(score.groupId, normalizedJudgeId, tournamentId);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (archiveError) {
          console.error('Error with aggressive archiving on retry:', archiveError);
        }
      } else {
        // First archive ALL existing scores for this group/tournament
        try {
          await GroupScoreDbService.archiveAllExistingScores(score.groupId, tournamentId);
        } catch (archiveError) {
          console.error('Error archiving existing scores:', archiveError);
        }
      }
      
      // If it's an admin creating a score, use a valid judge ID
      if (isAdminId(originalJudgeId)) {
        console.log('Admin user detected with ID:', originalJudgeId);
        const validJudgeId = await GroupScoreDbService.getValidJudgeId();
        console.log('Using judge ID for admin submission:', validJudgeId);
        
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, validJudgeId, originalJudgeId);
      } else {
        // Regular judge case - use the normalized UUID
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
    originalJudgeId?: string
  ): Promise<GroupScore> {
    try {
      // Add a delay to ensure archiving is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create the new score with improved error handling - pass the original judgeId as userId for modified_by
      const data = await GroupScoreDbService.createScore(score, dbJudgeId, originalJudgeId);
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: originalJudgeId || data.judge_id, // Use original ID for UI if provided
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
