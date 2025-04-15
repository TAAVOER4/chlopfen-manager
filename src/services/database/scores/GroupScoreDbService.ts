
import { BaseScoreService } from './BaseScoreService';
import { GroupScore } from '@/types';
import { isAdminId, normalizeUuid, getDatabaseJudgeId } from './utils/ValidationUtils';

export class GroupScoreDbService extends BaseScoreService {
  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string, modifiedBy?: string) {
    const supabase = this.checkSupabaseClient();
    
    try {
      const normalizedJudgeId = normalizeUuid(judgeId);
      const normalizedModifiedBy = modifiedBy ? normalizeUuid(modifiedBy) : null;
      
      console.log('Creating score with normalized judge ID:', normalizedJudgeId);
      console.log('Score data:', score);
      
      // First, archive all existing active records
      console.log('Archiving existing scores...');
      const { error: historyError } = await supabase
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
      
      if (historyError) {
        console.error('Error historizing group scores:', historyError);
        throw new Error(`Fehler beim Historisieren der Gruppenbewertung: ${historyError.message}`);
      }
      
      // Wait to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Double-check that all records were archived
      const { data: checkAfterHistory, error: recheckError } = await supabase
        .from('group_scores')
        .select('id, group_id, judge_id')
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
          
      if (recheckError) {
        console.error('Error verifying history completion:', recheckError);
        throw new Error(`Error verifying history completion: ${recheckError.message}`);
      }
      
      if (checkAfterHistory && checkAfterHistory.length > 0) {
        console.error('Failed to archive all existing scores:', checkAfterHistory.length, 'still active');
        
        // Force explicit deletion as a fallback mechanism
        const idsToDelete = checkAfterHistory.map(record => record.id);
        console.log('Attempting force update for these IDs:', idsToDelete);
        
        for (const record of checkAfterHistory) {
          console.log(`Force archiving record: ID=${record.id}, Group=${record.group_id}, Judge=${record.judge_id}`);
          
          const { error: forcedUpdateError } = await supabase
            .from('group_scores')
            .update({
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: normalizedModifiedBy
            })
            .eq('id', record.id);
            
          if (forcedUpdateError) {
            console.error(`Error forced archiving for ID ${record.id}:`, forcedUpdateError);
          }
        }
        
        // Check one more time after forced updates
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: finalCheck, error: finalCheckError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('judge_id', normalizedJudgeId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (finalCheckError) {
          console.error('Error on final verification check:', finalCheckError);
          throw new Error(`Error on final verification: ${finalCheckError.message}`);
        }
        
        if (finalCheck && finalCheck.length > 0) {
          console.error('Still failed to archive all records after forced updates:', finalCheck.length, 'records');
          throw new Error('Fehler: Die vorhandenen Bewertungen konnten nicht vollständig historisiert werden. Bitte versuchen Sie es später erneut.');
        }
      }
      
      console.log('All existing scores successfully archived, proceeding with new score creation');
      
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
      
      // Archive all current records for this specific combination
      const { error } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error in force archiving scores:', error);
        throw new Error(`Error force archiving scores: ${error.message}`);
      }
      
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
