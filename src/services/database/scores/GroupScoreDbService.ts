
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
      
      // First manually archive any existing active records to ensure none exist
      console.log('Explicitly archiving any existing active records before creation...');
      const { error: archiveError } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString(),
          modified_by: normalizedModifiedBy
        })
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
        
      if (archiveError) {
        console.error('Error archiving existing records:', archiveError);
        // Continue anyway as we'll check if any remain active
      }
      
      // Double-check that all records were archived before creating a new one
      console.log('Verifying no active records exist before creation...');
      const { data: checkActive, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
          
      if (checkError) {
        console.error('Error checking for active records:', checkError);
        throw new Error(`Error checking active records: ${checkError.message}`);
      }
      
      if (checkActive && checkActive.length > 0) {
        console.error('Found existing active scores that were not archived:', checkActive.length);
        
        // One more attempt to force archive each record individually
        for (const record of checkActive) {
          console.log(`Attempting to force archive score ID ${record.id}`);
          await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: normalizedModifiedBy
            })
            .eq('id', record.id);
            
          // Small delay between operations
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Final check
        const { data: finalCheck } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('judge_id', normalizedJudgeId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (finalCheck && finalCheck.length > 0) {
          throw new Error('Es existieren noch aktive Bewertungen. Bitte versuchen Sie es später erneut.');
        }
      }
      
      console.log('No active records found, proceeding with score creation');
      
      // Create a new current record
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
      
      // Use direct, single UPDATE statement for all records at once
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
