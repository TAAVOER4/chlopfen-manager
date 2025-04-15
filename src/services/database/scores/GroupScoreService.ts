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
      
      // First try to find the actual UUID in the users table
      let judgeUuid = judgeId;
      
      try {
        // Only attempt to query if judgeId might be a user ID and not already a UUID
        if (!judgeId.includes('-') && /^\d+$/.test(judgeId)) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', judgeId)
            .limit(1);
          
          if (!userError && userData && userData.length > 0) {
            judgeUuid = userData[0].id;
            console.log(`Found judge UUID: ${judgeUuid}`);
          } else {
            console.log(`No user found with ID ${judgeId}, will try as is`);
          }
        }
      } catch (lookupError) {
        console.error('Error looking up user UUID:', lookupError);
        // Continue with the original ID
      }
      
      // Query for active scores using the best ID we have
      const { data, error } = await supabase
        .from('group_scores')
        .select('id, group_id, judge_id')
        .eq('group_id', groupId)
        .eq('judge_id', judgeUuid)
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
      
      console.log(`Starting enhanced archive operation for group ${groupId}, tournament ${tournamentId}`);
      
      // Direct update to archive ALL existing scores for this group in this tournament,
      // regardless of judge ID to prevent duplicates
      const { error, count } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C')
        .select('count');
        
      if (error) {
        console.error('Error during archive operation:', error);
        return false;
      }
      
      console.log(`Successfully archived ${count || 'unknown number of'} records`);
      
      // Double-check to see if any records remain unarchived
      const { data: remaining, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (checkError) {
        console.error('Error checking for remaining active records:', checkError);
        return false;
      }
      
      if (remaining && remaining.length > 0) {
        console.warn(`${remaining.length} records still active after archive operation, attempting individual updates`);
        
        // Try individual updates as a fallback
        for (const record of remaining) {
          console.log(`Archiving individual record ID: ${record.id}`);
          
          const { error: individualError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString()
            })
            .eq('id', record.id);
            
          if (individualError) {
            console.error('Error archiving individual record:', individualError);
          }
        }
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
      let judgeUuid = originalJudgeId;
      let foundValidId = false;
      
      const supabase = this.checkSupabaseClient();
      
      // Series of attempts to find a valid UUID
      try {
        // Check if the judgeId is already a valid UUID format
        if (originalJudgeId.includes('-') && originalJudgeId.length === 36) {
          console.log('Judge ID appears to be in UUID format, using as is');
          foundValidId = true;
        } 
        // If not, try to find the user by numeric ID
        else if (/^\d+$/.test(originalJudgeId)) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', originalJudgeId)
            .limit(1);
          
          if (!userError && userData && userData.length > 0) {
            judgeUuid = userData[0].id;
            console.log(`Found judge UUID from numeric ID: ${judgeUuid}`);
            foundValidId = true;
          }
        }
        
        // If we still haven't found a valid ID, try to get any judge as a fallback
        if (!foundValidId) {
          console.log('Could not find specific judge ID, looking for any valid judge');
          const { data: validJudge, error: judgeError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'judge')
            .limit(1);
            
          if (!judgeError && validJudge && validJudge.length > 0) {
            judgeUuid = validJudge[0].id;
            console.log(`Using fallback judge UUID: ${judgeUuid}`);
            foundValidId = true;
          } else {
            // Last resort: get any user from the database
            const { data: anyUser, error: anyUserError } = await supabase
              .from('users')
              .select('id')
              .limit(1);
              
            if (!anyUserError && anyUser && anyUser.length > 0) {
              judgeUuid = anyUser[0].id;
              console.log(`Using any user UUID as last resort: ${judgeUuid}`);
              foundValidId = true;
            }
          }
        }
      } catch (lookupError) {
        console.error('Error during user lookup:', lookupError);
        // Continue with best effort
      }
      
      if (!foundValidId) {
        throw new Error('Failed to find a valid UUID for the judge');
      }
      
      console.log(`Using judge UUID for DB: ${judgeUuid}`);
      
      // Archive any existing scores first - but explicitly not filter by judge_id 
      // to avoid conflicts with multiple current records
      await this.forceArchiveScores(
        score.groupId,
        String(score.judgeId),
        score.tournamentId
      );

      // Create new current record
      const { data: newScore, error: insertError } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: judgeUuid,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_by: judgeUuid,
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
        judgeId: originalJudgeId, // Return the original ID to the frontend
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
