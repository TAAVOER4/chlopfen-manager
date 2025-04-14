
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
        .select('*')
        .eq('group_id', score.groupId)
        .eq('judge_id', normalizedJudgeId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C')
        .maybeSingle();
      
      if (existingScore) {
        // Historisiere den bestehenden Datensatz (setze record_type auf 'H')
        const { error: historyError } = await supabase
          .from('group_scores')
          .update({
            record_type: 'H',
            modified_at: new Date().toISOString(),
            modified_by: normalizedModifiedBy
          })
          .eq('id', existingScore.id);
        
        if (historyError) {
          console.error('Error historizing group score:', historyError);
          throw new Error(`Fehler beim Historisieren der Gruppenbewertung: ${historyError.message}`);
        }
        
        // Erstelle einen neuen aktuellen Datensatz mit 'C'
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
          console.error('Error creating new group score after historizing:', insertError);
          
          // Versuche den alten Datensatz wiederherzustellen bei Fehler
          await supabase
            .from('group_scores')
            .update({ record_type: 'C' })
            .eq('id', existingScore.id);
            
          throw new Error(`Fehler beim Erstellen der neuen Gruppenbewertung: ${insertError.message}`);
        }
        
        return newScore;
      } else {
        // Kein bestehender Datensatz, erstelle einen neuen
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
            modified_by: normalizedModifiedBy,
            modified_at: new Date().toISOString()
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
