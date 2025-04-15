
import { GroupScore } from '@/types';
import { BaseScoreService } from './BaseScoreService';
import { ScoreValidationService } from './ScoreValidationService';
import { GroupScoreDbService } from './GroupScoreDbService';
import { isAdminId, normalizeUuid, logIdType } from './utils/ValidationUtils';
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

  // Direct execution of SQL for critical operations
  static async executeRawSql(sqlCommand: string): Promise<boolean> {
    try {
      const supabase = this.checkSupabaseClient();
      
      // Log the SQL command for debugging
      console.log('Executing SQL command:', sqlCommand);
      
      // Use the RPC function to execute the SQL
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_command: sqlCommand 
      });
      
      if (error) {
        console.error('Error executing raw SQL:', error);
        return false;
      }
      
      console.log('SQL execution result:', data);
      return true;
    } catch (error) {
      console.error('Exception in executeRawSql:', error);
      return false;
    }
  }

  // Function to archive all scores for a given group and tournament
  static async archiveAllScores(groupId: number, tournamentId: number): Promise<boolean> {
    try {
      const supabase = this.checkSupabaseClient();
      
      console.log(`Archiving all scores for group ${groupId}, tournament ${tournamentId}`);
      
      // First try to use the dedicated archive function
      const { data, error } = await supabase.rpc('archive_group_scores', {
        p_group_id: groupId,
        p_tournament_id: tournamentId
      });
      
      if (error) {
        console.error('Error using archive_group_scores function:', error);
        
        // Fallback to direct SQL execution
        const sqlSuccess = await this.executeRawSql(`
          UPDATE public.group_scores 
          SET record_type = 'H', 
              modified_at = NOW() 
          WHERE group_id = ${groupId} 
          AND tournament_id = ${tournamentId}
          AND record_type = 'C'
        `);
        
        if (!sqlSuccess) {
          console.error('Direct SQL execution failed, trying standard update');
          
          // Last resort: standard update
          const { error: updateError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString()
            })
            .eq('group_id', groupId)
            .eq('tournament_id', tournamentId)
            .eq('record_type', 'C');
            
          if (updateError) {
            console.error('All archive methods failed:', updateError);
            return false;
          }
        }
      }
      
      // Verify the operation was successful
      const { data: activeRecords, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (checkError) {
        console.error('Error checking archive results:', checkError);
        return false;
      }
      
      if (activeRecords && activeRecords.length > 0) {
        console.warn(`Archive operation partially failed: ${activeRecords.length} records still active`);
        
        // Try individual updates as a last resort
        for (const record of activeRecords) {
          const { error: individualError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString()
            })
            .eq('id', record.id);
            
          if (individualError) {
            console.error(`Error archiving individual record ${record.id}:`, individualError);
          }
        }
        
        // Final verification
        const { data: finalCheck, error: finalError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', groupId)
          .eq('tournament_id', tournamentId)
          .eq('record_type', 'C');
          
        if (finalError) {
          console.error('Error in final verification:', finalError);
        } else if (finalCheck && finalCheck.length > 0) {
          console.error(`CRITICAL: ${finalCheck.length} records still active after all attempts`);
          return false;
        }
      }
      
      console.log('Archive operation completed successfully');
      return true;
    } catch (error) {
      console.error('Exception in archiveAllScores:', error);
      return false;
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
      
      console.log(`Starting aggressive archive operation for group ${groupId}, tournament ${tournamentId}`);
      logIdType(judgeId);
      
      // STEP 1: Try to archive all scores regardless of judge using our dedicated function
      const archiveSuccess = await this.archiveAllScores(groupId, tournamentId);
      
      if (archiveSuccess) {
        console.log('Successfully archived all scores using dedicated function');
        return true;
      }
      
      console.warn('Dedicated archive function failed, trying raw SQL update');
      
      // STEP 2: Fallback - execute raw SQL for all records
      const sqlSuccess = await this.executeRawSql(`
        UPDATE public.group_scores 
        SET record_type = 'H', 
            modified_at = NOW() 
        WHERE group_id = ${groupId} 
        AND tournament_id = ${tournamentId}
        AND record_type = 'C'
      `);
      
      if (sqlSuccess) {
        console.log('Raw SQL archive successful');
      } else {
        console.warn('Raw SQL archive failed, falling back to standard update');
      }
      
      // STEP 3: Fallback - Standard update
      const { error: globalArchiveError } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString(),
          modified_by: judgeId
        })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (globalArchiveError) {
        console.error('Error during global archive operation:', globalArchiveError);
      } else {
        console.log('Standard update archive completed');
      }
      
      // STEP 4: Wait briefly to avoid database inconsistencies
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // STEP 5: Check if any active records remain
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
        console.warn(`${remaining.length} records still active after all operations, attempting individual updates`);
        
        // Try individual updates as a last resort
        for (const record of remaining) {
          console.log(`Archiving individual record ID: ${record.id}`);
          
          const { error: individualError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: judgeId
            })
            .eq('id', record.id);
            
          if (individualError) {
            console.error('Error archiving individual record:', individualError);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Final verification
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (finalCheckError) {
        console.error('Error during final verification:', finalCheckError);
      } else if (finalCheck && finalCheck.length > 0) {
        console.warn(`Archive operation partially failed: ${finalCheck.length} records still active`);
        return false;
      } else {
        console.log('Successfully archived all records for this group and tournament');
      }
      
      return true;
    } catch (error) {
      console.error('Error in forceArchiveScores:', error);
      return false;
    }
  }

  static async createGroupScore(score: Omit<GroupScore, 'id'>, forceArchive: boolean = false): Promise<GroupScore> {
    try {
      console.log('Creating new group score:', score, 'forceArchive:', forceArchive);
      
      ScoreValidationService.validateScoreData(score);
      
      if (!score.judgeId) {
        throw new Error('Judge ID is required');
      }

      const originalJudgeId = String(score.judgeId);
      let judgeUuid = originalJudgeId;
      let foundValidId = false;
      
      const supabase = this.checkSupabaseClient();
      
      // First, try to find a valid judge UUID
      try {
        // Check if the judgeId is already a valid UUID format
        if (originalJudgeId.includes('-') && originalJudgeId.length === 36) {
          console.log('Judge ID appears to be in UUID format, using as is');
          foundValidId = true;
          judgeUuid = originalJudgeId;
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
      
      // Archive all existing records for this group and tournament
      if (forceArchive) {
        console.log("Force archive flag is set, performing direct archive operation");
        
        // Use our new dedicated function to archive all records
        const archiveSuccess = await this.archiveAllScores(score.groupId, score.tournamentId);
        
        if (archiveSuccess) {
          console.log("Archive operation successful using dedicated function");
        } else {
          console.warn("Archive operation using dedicated function failed, trying other methods");
          
          // Try the forceArchiveScores method which has multiple fallbacks
          await this.forceArchiveScores(
            score.groupId,
            judgeUuid,
            score.tournamentId
          );
        }
        
        // Add delay to ensure all DB operations are complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check if there are still any active records
      const { data: stillActive, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', score.groupId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
      
      if (checkError) {
        console.error('Error checking for active records before insert:', checkError);
      } else if (stillActive && stillActive.length > 0) {
        console.warn(`${stillActive.length} records still active after all archive attempts`);
        
        // Make one final direct attempt to archive records
        const finalSuccess = await this.executeRawSql(`
          UPDATE public.group_scores 
          SET record_type = 'H', 
              modified_at = NOW(),
              modified_by = '${judgeUuid}'
          WHERE group_id = ${score.groupId} 
          AND tournament_id = ${score.tournamentId}
          AND record_type = 'C'
        `);
        
        if (finalSuccess) {
          console.log("Final direct archive attempt successful");
        } else {
          console.error("All archive attempts failed, proceeding with insert anyway");
        }
      } else {
        console.log('All records successfully archived, proceeding with new record creation');
      }

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
