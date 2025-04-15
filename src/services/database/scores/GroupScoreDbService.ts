import { BaseScoreService } from './BaseScoreService';
import { GroupScore } from '@/types';
import { isAdminId, normalizeUuid } from './utils/ValidationUtils';

export class GroupScoreDbService extends BaseScoreService {
  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string, modifiedBy?: string) {
    const supabase = this.checkSupabaseClient();
    
    try {
      const normalizedJudgeId = normalizeUuid(judgeId);
      const normalizedModifiedBy = modifiedBy ? normalizeUuid(modifiedBy) : normalizedJudgeId;
      
      console.log('Creating score with normalized judge ID:', normalizedJudgeId);
      console.log('Score data:', score);
      
      // Versuche erst direkt mit SQL alle aktiven Datensätze zu archivieren
      try {
        console.log(`Executing direct SQL update for archiving before insert...`);
        const rawSqlResult = await supabase.rpc('execute_sql', {
          sql_command: `
            UPDATE public.group_scores 
            SET record_type = 'H', 
                modified_at = NOW(),
                modified_by = '${normalizedModifiedBy}'
            WHERE group_id = ${score.groupId} 
            AND tournament_id = ${score.tournamentId}
            AND record_type = 'C'
          `
        });
        
        if (rawSqlResult.error) {
          console.error('Error with direct SQL archive:', rawSqlResult.error);
        } else {
          console.log('Direct SQL archive completed successfully');
          
          // Warte nach der SQL-Operation
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (sqlError) {
        console.error('Exception during direct SQL archive:', sqlError);
      }
      
      // Dann überprüfe, ob noch aktive Datensätze vorhanden sind
      const { data: activeScores, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', score.groupId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
        
      if (checkError) {
        console.error('Error checking for active scores:', checkError);
        throw new Error(`Error checking active records: ${checkError.message}`);
      }
      
      // Wenn noch aktive Datensätze vorhanden sind, versuche sie mit RPC zu archivieren
      if (activeScores && activeScores.length > 0) {
        console.log(`Found ${activeScores.length} active scores that need to be archived first`);
        
        // Versuche zuerst mit der RPC-Funktion zu archivieren
        try {
          const { error: archiveError } = await supabase.rpc('force_archive_group_scores', {
            p_group_id: score.groupId, 
            p_judge_id: normalizedJudgeId, 
            p_tournament_id: score.tournamentId,
            p_modified_by: normalizedModifiedBy
          });
            
          if (archiveError) {
            console.error('Error using RPC to archive scores:', archiveError);
          } else {
            console.log('Successfully used RPC function to archive scores');
          }
        } catch (rpcError) {
          console.error('Exception during RPC archive call:', rpcError);
        }
        
        // Warte nach dem RPC-Aufruf
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Überprüfe erneut, ob noch aktive Datensätze vorhanden sind
        const { data: checkActive, error: recheckError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
            
        if (recheckError) {
          console.error('Error rechecking for active records:', recheckError);
        }
        
        // Wenn immer noch aktive Datensätze vorhanden sind, versuche es mit direktem Update
        if (checkActive && checkActive.length > 0) {
          console.error('Failed to archive all records via RPC. Falling back to direct updates.');
          
          const { error: directUpdateError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: normalizedModifiedBy
            })
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          if (directUpdateError) {
            console.error('Error with direct update archiving:', directUpdateError);
          }
          
          // Warte nach dem direkten Update
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Finale Überprüfung
          const { data: finalCheck, error: finalCheckError } = await supabase
            .from('group_scores')
            .select('id')
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          if (finalCheckError) {
            console.error('Error during final check:', finalCheckError);
          }
          
          if (finalCheck && finalCheck.length > 0) {
            console.error(`CRITICAL: After multiple attempts, ${finalCheck.length} records still active.`);
            throw new Error('Auch nach mehreren Versuchen konnten die vorhandenen Bewertungen nicht archiviert werden.');
          }
        }
      }
      
      console.log('No remaining active records, proceeding with score creation');
      
      // Erstelle einen neuen aktiven Datensatz
      const { data: newScore, error: insertError } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: normalizedJudgeId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_by: normalizedModifiedBy,
          modified_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating new group score:', insertError);
        throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${insertError.message}`);
      }
      
      console.log('Successfully created new score:', newScore);
      return newScore;
    } catch (error) {
      console.error('Error in createScore:', error);
      throw error;
    }
  }
  
  static async forceArchiveExistingScores(groupId: number, judgeId: string, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    try {
      const normalizedJudgeId = normalizeUuid(judgeId);
      
      console.log(`Using DBService to archive scores for group ${groupId}, judge ${normalizedJudgeId}`);
      
      // First check if there are any active records
      const { data: activeRecords, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
      
      if (checkError) {
        console.error('Error checking for active records:', checkError);
        throw new Error(`Error checking for active records: ${checkError.message}`);
      }
      
      if (!activeRecords || activeRecords.length === 0) {
        console.log('No active records found to archive');
        return true; // No records to archive, so we're done
      }
      
      console.log(`Found ${activeRecords.length} active records to archive`);
      
      // Try RPC function first if available
      try {
        const { error: rpcError } = await supabase.rpc('force_archive_group_scores', {
          p_group_id: groupId, 
          p_judge_id: normalizedJudgeId, 
          p_tournament_id: tournamentId,
          p_modified_by: normalizedJudgeId
        });
        
        if (rpcError) {
          console.error('Error using RPC to archive scores:', rpcError);
          // Continue to fallback method
        } else {
          console.log('Successfully used RPC function to archive scores');
          
          // Verify all records were archived
          const { data: afterRpc, error: verifyRpcError } = await supabase
            .from('group_scores')
            .select('id')
            .eq('group_id', groupId)
            .eq('judge_id', normalizedJudgeId)
            .eq('tournament_id', tournamentId)
            .eq('record_type', 'C');
            
          if (!verifyRpcError && (!afterRpc || afterRpc.length === 0)) {
            console.log('RPC function successfully archived all records');
            return true;
          }
          
          console.log(`RPC function left ${afterRpc?.length || 0} records unarchived`);
        }
      } catch (rpcError) {
        console.error('Exception during RPC archive call:', rpcError);
      }
      
      // Use direct, single UPDATE statement for all records at once
      console.log('Falling back to direct UPDATE statement');
      
      const { error } = await supabase
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
          
      if (error) {
        console.error('Error archiving records in bulk:', error);
        throw new Error(`Error archiving records: ${error.message}`);
      }
      
      // Verify all records were archived
      const { data: remainingActive, error: verifyError } = await supabase
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
      
      if (remainingActive && remainingActive.length > 0) {
        console.error(`Failed to archive all records: ${remainingActive.length} still active`);
        
        // Try individual record archiving as a fallback
        console.log('Falling back to individual record archiving');
        let successCount = 0;
        
        for (const record of remainingActive) {
          console.log(`Archiving individual record ID: ${record.id}`);
          
          const { error: individualError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: normalizedJudgeId
            })
            .eq('id', record.id);
            
          if (!individualError) {
            successCount++;
          }
          
          // Add a small delay between operations
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`Individually archived ${successCount} of ${remainingActive.length} records`);
        
        // Final verification
        const { data: finalCheck, error: finalCheckError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', groupId)
          .eq('judge_id', normalizedJudgeId)
          .eq('tournament_id', tournamentId)
          .eq('record_type', 'C');
          
        if (finalCheckError) {
          console.error('Error during final verification:', finalCheckError);
          return false;
        }
        
        if (finalCheck && finalCheck.length > 0) {
          console.error(`Final archiving attempt failed: ${finalCheck.length} records still active`);
          return false;
        }
      }
      
      console.log('Successfully archived all records');
      return true;
    } catch (error) {
      console.error('Error in forceArchiveExistingScores:', error);
      throw error;
    }
  }

  static async getValidJudgeId() {
    const supabase = this.checkSupabaseClient();
    
    const { data: validJudge, error: judgeError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'judge')
      .eq('record_type', 'C')
      .limit(1)
      .single();
      
    if (judgeError || !validJudge) {
      console.error('Error finding a valid judge:', judgeError);
      throw new Error('Unable to find a valid judge ID for admin submissions');
    }
    
    return validJudge.id;
  }
}
