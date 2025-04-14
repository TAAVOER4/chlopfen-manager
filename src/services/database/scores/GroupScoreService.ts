
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
      
      // Make sure judgeId is a string
      const judgeId = String(score.judgeId);
      
      // Ensure numeric fields have values or defaults
      // This is critical since database has NOT NULL constraints
      // For judges, these should have values if they are assigned to judge this criterion
      
      // Handle null values for fields that might be null in the request
      // but are required as NOT NULL in the database
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
      
      // First attempt to get user information to determine role
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', judgeId)
        .maybeSingle();
      
      console.log('User lookup result:', userExists, userError);
      
      // If we're dealing with an admin user (numeric ID), use anon role
      // instead of trying to store it as a UUID
      let insertJudgeId = judgeId;
      let anonRole = false;
      
      if (!userExists && !isNaN(Number(judgeId))) {
        console.log('Using anon role for numeric admin ID:', judgeId);
        anonRole = true;
        // For admin users with numeric IDs, we'll use a special identifier
        // that won't trigger the UUID validation error
        insertJudgeId = '00000000-0000-0000-0000-000000000000';
      } else if (userError) {
        console.error('Error checking user existence:', userError);
        throw new Error(`Error verifying user: ${userError.message}`);
      }
      
      // Insert the data, ensuring we have values for all required fields
      const { data, error } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: insertJudgeId, // Use the special ID for admin users
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
        
        // Provide a more user-friendly error message
        if (error.code === '23503') {
          throw new Error(`Fehler: Ein referenzierter Datensatz (Benutzer, Gruppe oder Turnier) existiert nicht.`);
        } else if (error.code === '23505') {
          throw new Error(`Fehler: Es existiert bereits eine Bewertung für diese Gruppe von diesem Richter.`);
        } else {
          throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
        }
      }
      
      if (!data) {
        throw new Error('No data returned from score creation');
      }
      
      // If we used the anon role, restore the original judge ID for the response
      const returnedJudgeId = anonRole ? judgeId : data.judge_id;
      
      return {
        id: data.id,
        groupId: data.group_id,
        judgeId: returnedJudgeId, // Return the original ID for admins
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
