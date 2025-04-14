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

  /**
   * Validates if a string is a valid UUID format
   * @param id string to check
   * @returns boolean indicating if the string is a valid UUID
   */
  private static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Checks if a user ID is likely an admin ID (numeric)
   * @param id user ID to check
   * @returns boolean indicating if the ID is likely an admin ID
   */
  private static isAdminId(id: string): boolean {
    // If it's a number or a string that only contains digits
    return !isNaN(Number(id)) && /^\d+$/.test(id);
  }

  static async createOrUpdateGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    try {
      console.log('Creating or updating group score:', score);
      
      // Validate inputs
      if (!score.groupId) {
        throw new Error('Group ID is required');
      }
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }
      
      // Make sure judgeId is a string
      const judgeId = String(score.judgeId);
      
      // Ensure numeric fields have values or defaults
      const whipStrikes = score.whipStrikes === null ? 0 : score.whipStrikes;
      const rhythm = score.rhythm === null ? 0 : score.rhythm;
      const tempo = score.tempo === null ? 0 : score.tempo;

      // Validate numeric fields have valid values
      if (whipStrikes !== undefined && (isNaN(Number(whipStrikes)) || Number(whipStrikes) < 0)) {
        throw new Error('Invalid value for whip strikes');
      }
      
      if (rhythm !== undefined && (isNaN(Number(rhythm)) || Number(rhythm) < 0)) {
        throw new Error('Invalid value for rhythm');
      }
      
      if (tempo !== undefined && (isNaN(Number(tempo)) || Number(tempo) < 0)) {
        throw new Error('Invalid value for tempo');
      }

      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      const supabase = this.checkSupabaseClient();
      
      // Check if the user ID is an admin ID (numeric)
      const isAdmin = this.isAdminId(judgeId);
      
      // First, check if a score already exists for this group
      console.log(`Checking if a score already exists for group ${score.groupId} in tournament ${tournamentId}`);
      
      const { data: existingScores, error: queryError } = await supabase
        .from('group_scores')
        .select('id, judge_id')
        .eq('group_id', score.groupId)
        .eq('tournament_id', tournamentId);
      
      if (queryError) {
        console.error('Error checking for existing scores:', queryError);
        throw new Error(`Error checking for existing scores: ${queryError.message}`);
      }
      
      console.log('Existing scores:', existingScores);
      
      // If an existing score is found, update it instead of creating a new one
      if (existingScores && existingScores.length > 0) {
        const existingScore = existingScores[0];
        console.log(`Found existing score with ID ${existingScore.id}, updating instead of creating`);
        
        // If it's an admin updating a score, use a valid judge ID from the database
        let updatedJudgeId = judgeId;
        
        if (isAdmin) {
          // If admin, keep the original judge_id to avoid messing up existing scores
          // This ensures the admin's changes don't change who the score appears to be from
          updatedJudgeId = existingScore.judge_id;
          console.log(`Admin is updating, keeping original judge_id: ${updatedJudgeId}`);
        }
        
        // Update the existing score
        const { data: updatedData, error: updateError } = await supabase
          .from('group_scores')
          .update({
            whip_strikes: whipStrikes,
            rhythm: rhythm,
            tempo: tempo,
            time: score.time,
            // Don't update these:
            // group_id: score.groupId,
            // judge_id: updatedJudgeId,
            // tournament_id: tournamentId
          })
          .eq('id', existingScore.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating group score:', updateError);
          throw new Error(`Error updating group score: ${updateError.message}`);
        }
        
        if (!updatedData) {
          throw new Error('No data returned from score update');
        }
        
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
      if (isAdmin) {
        console.log('Admin user detected with ID:', judgeId);
        
        // Get a valid judge ID from the users table to use for admin submissions
        const { data: validJudge, error: judgeError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'judge')
          .limit(1)
          .single();
        
        if (judgeError || !validJudge) {
          console.error('Error finding a valid judge:', judgeError);
          throw new Error('Unable to find a valid judge ID for admin submissions');
        }
        
        console.log('Using judge ID for admin submission:', validJudge.id);
        
        // Insert the score using the valid judge ID
        const { data, error } = await supabase
          .from('group_scores')
          .insert([{
            group_id: score.groupId,
            judge_id: validJudge.id, // Use a valid judge's UUID
            whip_strikes: whipStrikes,
            rhythm: rhythm,
            tempo: tempo,
            time: score.time,
            tournament_id: tournamentId
          }])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating group score:', error);
          
          if (error.code === '23503') {
            throw new Error('Fehler: Ein referenzierter Datensatz (Gruppe oder Turnier) existiert nicht.');
          } else if (error.code === '23505') {
            throw new Error('Fehler: Es existiert bereits eine Bewertung für diese Gruppe von diesem Richter.');
          } else {
            throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
          }
        }
        
        if (!data) {
          throw new Error('No data returned from score creation');
        }
        
        // Return the score with the original admin ID
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
        const { data, error } = await supabase
          .from('group_scores')
          .insert([{
            group_id: score.groupId,
            judge_id: judgeId,
            whip_strikes: whipStrikes,
            rhythm: rhythm,
            tempo: tempo,
            time: score.time,
            tournament_id: tournamentId
          }])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating group score:', error);
          
          if (error.code === '23503') {
            throw new Error('Fehler: Ein referenzierter Datensatz (Benutzer, Gruppe oder Turnier) existiert nicht.');
          } else if (error.code === '23505') {
            throw new Error('Fehler: Es existiert bereits eine Bewertung für diese Gruppe von diesem Richter.');
          } else {
            throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
          }
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
      }
    } catch (error) {
      console.error('Error in createOrUpdateGroupScore:', error);
      throw error;
    }
  }

  // Method alias for backward compatibility
  static async createGroupScore(score: Omit<GroupScore, 'id'>): Promise<GroupScore> {
    return this.createOrUpdateGroupScore(score);
  }

  static async updateGroupScore(score: GroupScore): Promise<GroupScore> {
    try {
      const tournamentId = typeof score.tournamentId === 'string' 
        ? parseInt(score.tournamentId, 10) 
        : score.tournamentId;
      
      // Validate judgeId type
      if (typeof score.judgeId !== 'string') {
        throw new Error('Judge ID must be a string');
      }
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }
      
      const supabase = this.checkSupabaseClient();
      
      // Check if the user exists and get their role
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', score.judgeId)
        .single();
        
      if (userError || !userExists) {
        throw new Error(`User with ID ${score.judgeId} does not exist`);
      }
      
      // Only validate UUID format for judges, not for admins
      if (userExists.role === 'judge' && !this.isValidUUID(score.judgeId)) {
        throw new Error('Judge ID must be in valid UUID format for judges');
      }
      
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
