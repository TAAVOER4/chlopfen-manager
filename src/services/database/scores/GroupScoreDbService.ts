
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
        throw new Error('Es existieren noch aktive Bewertungen. Bitte versuchen Sie es erneut.');
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
      
      // Archive all current records for this specific combination
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
        console.error('Error in force archiving scores:', error);
        throw new Error(`Error force archiving scores: ${error.message}`);
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
        throw new Error('Die vorhandenen Bewertungen konnten nicht vollständig historisiert werden.');
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
