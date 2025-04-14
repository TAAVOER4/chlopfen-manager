
import { BaseScoreService } from './BaseScoreService';
import { GroupScore } from '@/types';
import { isAdminId, normalizeUuid, getDatabaseJudgeId } from './utils/ValidationUtils';

export class GroupScoreDbService extends BaseScoreService {
  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string, modifiedBy?: string) {
    const supabase = this.checkSupabaseClient();
    
    try {
      const normalizedJudgeId = normalizeUuid(judgeId);
      const normalizedModifiedBy = modifiedBy ? normalizeUuid(modifiedBy) : null;
      
      // First, check if an active record already exists
      const { data: existingScore } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C')
        .maybeSingle();
      
      if (existingScore) {
        // Update the existing record instead of creating a new one
        const { data, error } = await supabase
          .from('group_scores')
          .update({
            whip_strikes: score.whipStrikes,
            rhythm: score.rhythm,
            tempo: score.tempo,
            time: score.time,
            modified_at: new Date().toISOString(),
            modified_by: normalizedModifiedBy
          })
          .eq('id', existingScore.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating group score:', error);
          throw new Error(`Fehler beim Aktualisieren der Gruppenbewertung: ${error.message}`);
        }
        
        return data;
      } else {
        // No existing record, insert a new one
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
          throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
        }
        
        return data;
      }
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
