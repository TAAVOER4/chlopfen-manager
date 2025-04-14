
import { BaseScoreService } from './BaseScoreService';
import { GroupScore } from '@/types';
import { isAdminId } from './utils/ValidationUtils';

export class GroupScoreDbService extends BaseScoreService {
  static async getExistingScore(groupId: number, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    const { data: existingScores, error: queryError } = await supabase
      .from('group_scores')
      .select('id, judge_id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId);
      
    if (queryError) {
      console.error('Error checking for existing scores:', queryError);
      throw new Error(`Error checking for existing scores: ${queryError.message}`);
    }

    return existingScores?.[0];
  }

  static async updateScore(scoreId: number, score: Partial<GroupScore>) {
    const supabase = this.checkSupabaseClient();
    
    const { data, error } = await supabase
      .from('group_scores')
      .update({
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
      })
      .eq('id', scoreId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating group score:', error);
      throw new Error(`Error updating group score: ${error.message}`);
    }
    
    return data;
  }

  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string) {
    const supabase = this.checkSupabaseClient();
    
    const { data, error } = await supabase
      .from('group_scores')
      .insert([{
        group_id: score.groupId,
        judge_id: judgeId,
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        tournament_id: score.tournamentId
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating group score:', error);
      
      if (error.code === '23503') {
        throw new Error('Fehler: Ein referenzierter Datensatz (Gruppe oder Turnier) existiert nicht.');
      } else if (error.code === '23505') {
        throw new Error('Fehler: Es existiert bereits eine Bewertung für diese Gruppe von diesem Richter.');
      } else {
        throw new Error(`Fehler beim Erstellen der Gruppenbewertung: ${error.message}`);
      }
    }
    
    return data;
  }

  static async getValidJudgeId() {
    const supabase = this.checkSupabaseClient();
    
    const { data: validJudge, error: judgeError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'judge')
      .limit(1)
      .single();
      
    if (judgeError || !validJudge) {
      console.error('Error finding a valid judge:', judgeError);
      throw new Error('Unable to find a valid judge ID for admin submissions');
    }
    
    return validJudge.id;
  }
}
