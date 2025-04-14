import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';
import { ScoreValidationService } from './ScoreValidationService';
import { GroupScoreDbService } from './GroupScoreDbService';
import { isAdminId } from './utils/ValidationUtils';

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
      
      // Validate inputs
      ScoreValidationService.validateScoreData(score);
      
      // Make sure judgeId is a string
      const judgeId = String(score.judgeId);
      
      // Ensure numeric fields have values or defaults
      const whipStrikes = score.whipStrikes === null ? 0 : score.whipStrikes;
      const rhythm = score.rhythm === null ? 0 : score.rhythm;
      const tempo = score.tempo === null ? 0 : score.tempo;

      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Check if a score already exists
      const existingScore = await GroupScoreDbService.getExistingScore(score.groupId, tournamentId);
      
      if (existingScore) {
        console.log(`Found existing score with ID ${existingScore.id}, historizing and creating new entry`);
        
        // If it's an admin updating a score, use a valid judge ID from the database
        const updatedJudgeId = isAdminId(judgeId) ? existingScore.judge_id : judgeId;
        console.log(`Admin is updating, keeping original judge_id: ${updatedJudgeId}`);
        
        // First historize the existing record, then create a new one
        const updatedData = await GroupScoreDbService.updateScore(existingScore.id, {
          whipStrikes,
          rhythm,
          tempo,
          time: score.time
        });
        
        return {
          id: updatedData.id,
          groupId: updatedData.group_id,
          judgeId: judgeId, // Return the original judgeId for UI consistency
          whipStrikes: updatedData.whip_strikes,
          rhythm: updatedData.rhythm,
          tempo: updatedData.tempo,
          time: updatedData.time,
          tournamentId: updatedData.tournament_id
        };
      }
      
      // If no existing score is found, create a new one
      console.log('No existing score found, creating a new one');
      
      // If it's an admin with numeric ID, we need to use a UUID from an existing judge
      if (isAdminId(judgeId)) {
        console.log('Admin user detected with ID:', judgeId);
        const validJudgeId = await GroupScoreDbService.getValidJudgeId();
        console.log('Using judge ID for admin submission:', validJudgeId);
        
        const data = await GroupScoreDbService.createScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, validJudgeId);
        
        return {
          id: data.id,
          groupId: data.group_id,
          judgeId: judgeId, // Return the admin ID, not the judge ID used for DB storage
          whipStrikes: data.whip_strikes,
          rhythm: data.rhythm,
          tempo: data.tempo,
          time: data.time,
          tournamentId: data.tournament_id
        };
      } else {
        // Regular judge case - just insert using their UUID
        const data = await GroupScoreDbService.createScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, judgeId);
        
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
      }
    } catch (error) {
      console.error('Error in createOrUpdateGroupScore:', error);
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
