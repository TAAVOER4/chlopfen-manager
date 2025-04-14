
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
      
      // Check if a score already exists - find any active (record_type='C') score for this combination
      const existingScore = await GroupScoreDbService.getExistingScore(score.groupId, tournamentId);
      
      if (existingScore) {
        console.log(`Found existing score with ID ${existingScore.id}, historizing and creating new entry`);
        
        // If it's an admin updating a score, use a valid judge ID from the database
        const updatedJudgeId = isAdminId(judgeId) ? existingScore.judge_id : judgeId;
        console.log(`Admin is updating, keeping original judge_id: ${updatedJudgeId}`);
        
        try {
          // First historize the existing record, then create a new one
          const updatedData = await GroupScoreDbService.updateScore(existingScore.id, {
            whipStrikes,
            rhythm,
            tempo,
            time: score.time,
            judgeId: updatedJudgeId // Make sure to use the correct judge ID
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
        } catch (error) {
          console.error('Error during score update:', error);
          
          // If there's a constraint error, try to archive all existing scores first
          if (error instanceof Error && error.message.includes('unique constraint')) {
            console.log('Handling unique constraint error by archiving all existing scores');
            
            const supabase = this.checkSupabaseClient();
            await supabase
              .from('group_scores')
              .update({ record_type: 'H' })
              .eq('group_id', score.groupId)
              .eq('tournament_id', tournamentId)
              .eq('record_type', 'C');
              
            // Then create a completely new score
            return await this.createNewScore({
              ...score,
              whipStrikes,
              rhythm,
              tempo
            }, isAdminId(judgeId) ? await GroupScoreDbService.getValidJudgeId() : judgeId);
          }
          
          throw error;
        }
      }
      
      // If no existing score is found, create a new one
      console.log('No existing score found, creating a new one');
      
      // If it's an admin with numeric ID, we need to use a UUID from an existing judge
      if (isAdminId(judgeId)) {
        console.log('Admin user detected with ID:', judgeId);
        const validJudgeId = await GroupScoreDbService.getValidJudgeId();
        console.log('Using judge ID for admin submission:', validJudgeId);
        
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, validJudgeId, judgeId);
      } else {
        // Regular judge case - just insert using their UUID
        return await this.createNewScore({
          ...score,
          whipStrikes,
          rhythm,
          tempo
        }, judgeId);
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
      // First, archive any existing records for this combination
      const supabase = this.checkSupabaseClient();
      await supabase
        .from('group_scores')
        .update({ record_type: 'H' })
        .eq('group_id', score.groupId)
        .eq('tournament_id', score.tournamentId)
        .eq('judge_id', dbJudgeId)
        .eq('record_type', 'C');
        
      // Now create the new score
      const data = await GroupScoreDbService.createScore(score, dbJudgeId);
      
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
