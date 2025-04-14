
import { BaseScoreService } from './BaseScoreService';
import { GroupScore } from '@/types';
import { isAdminId, normalizeUuid } from './utils/ValidationUtils';

export class GroupScoreDbService extends BaseScoreService {
  static async getExistingScore(groupId: number, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    const { data: existingScores, error: queryError } = await supabase
      .from('group_scores')
      .select('id, judge_id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (queryError) {
      console.error('Error checking for existing scores:', queryError);
      throw new Error(`Error checking for existing scores: ${queryError.message}`);
    }

    return existingScores?.[0];
  }

  static async updateScore(scoreId: number, score: Partial<GroupScore>, modifiedBy?: string) {
    try {
      console.log('Historizing and creating new score entry with:', score);
      
      // If modifiedBy is provided, ensure it's in the correct format
      const normalizedModifiedBy = modifiedBy ? normalizeUuid(modifiedBy) : null;
      
      // Make sure judgeId is normalized if provided
      const normalizedJudgeId = score.judgeId ? normalizeUuid(String(score.judgeId)) : undefined;
      
      // Historize the old entry and create a new one with modified_by set if available
      const historyData = {
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        judge_id: normalizedJudgeId,
        modified_by: normalizedModifiedBy
      };
      
      const result = await this.historizeAndCreate('group_scores', scoreId, historyData);
      console.log('Historization and creation successful:', result);
      return result;
    } catch (error) {
      console.error('Error updating group score:', error);
      throw new Error(`Error updating group score: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string, modifiedBy?: string) {
    const supabase = this.checkSupabaseClient();
    
    try {
      // Ensure judgeId and modifiedBy are in the correct format
      const normalizedJudgeId = normalizeUuid(judgeId);
      const normalizedModifiedBy = modifiedBy ? normalizeUuid(modifiedBy) : null;
      
      console.log('Creating score with normalized IDs:', {
        judgeId: normalizedJudgeId,
        modifiedBy: normalizedModifiedBy
      });
      
      // First do a direct cleanup of any existing records to prevent constraint violations
      const { error: cleanupError } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_by: normalizedModifiedBy,
          modified_at: new Date().toISOString()
        })
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
        
      if (cleanupError) {
        console.error('Warning - error during cleanup phase:', cleanupError);
        // Continue anyway since we'll handle it in the insert
      }
      
      // Add a delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Now create the new score with a direct insert
      const { data, error } = await supabase
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
          modified_by: normalizedModifiedBy
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating group score:', error);
        
        if (error.code === '23503') {
          throw new Error('Fehler: Ein referenzierter Datensatz (Gruppe oder Turnier) existiert nicht.');
        } else if (error.code === '23505') {
          // Handle the unique constraint violation with historization approach
          console.log('Unique constraint violation detected, using historization approach');
          
          // First get the conflicting record
          const { data: existingRecord, error: fetchError } = await supabase
            .from('group_scores')
            .select('id')
            .eq('group_id', score.groupId)
            .eq('judge_id', normalizedJudgeId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C')
            .single();
            
          if (fetchError) {
            console.error('Error fetching existing record:', fetchError);
            throw new Error('Datenbankfehler beim Aktualisieren der bestehenden Bewertung.');
          }
          
          if (!existingRecord) {
            throw new Error('Fehler: Die bestehende Bewertung konnte nicht gefunden werden.');
          }
          
          // Now properly historize and create a new record
          const historyResult = await this.historizeAndCreate('group_scores', existingRecord.id, {
            group_id: score.groupId,
            judge_id: normalizedJudgeId,
            whip_strikes: score.whipStrikes,
            rhythm: score.rhythm,
            tempo: score.tempo,
            time: score.time,
            tournament_id: score.tournamentId,
            modified_by: normalizedModifiedBy
          });
          
          return historyResult;
        } else {
          throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error in createScore:', error);
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
  
  static async archiveAllExistingScores(groupId: number, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    try {
      console.log(`Archiving all existing scores for group ${groupId} in tournament ${tournamentId}`);
      
      const { error } = await supabase
        .from('group_scores')
        .update({ record_type: 'H' })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error archiving all existing scores:', error);
        throw new Error(`Error archiving all existing scores: ${error.message}`);
      }
      
      console.log(`Successfully archived all existing scores for group ${groupId} in tournament ${tournamentId}`);
      return true;
    } catch (error) {
      console.error('Error in archiveAllExistingScores:', error);
      throw error;
    }
  }
  
  static async forceArchiveExistingScores(groupId: number, judgeId: string, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    try {
      // Ensure judgeId is in the correct format
      const normalizedJudgeId = normalizeUuid(judgeId);
      
      console.log(`Force archiving specific scores for group ${groupId}, judge ${normalizedJudgeId}, tournament ${tournamentId}`);
      
      // First - directly delete any records in error state that might be causing issues
      await supabase
        .from('group_scores')
        .delete()
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'E');
      
      // Then archive all current records for this specific combination
      const { error } = await supabase
        .from('group_scores')
        .update({ record_type: 'H' })
        .eq('group_id', groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error in force archiving scores:', error);
        throw new Error(`Error force archiving scores: ${error.message}`);
      }
      
      // Add a delay to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error in forceArchiveExistingScores:', error);
      throw error;
    }
  }
}
