
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
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (queryError) {
      console.error('Error checking for existing scores:', queryError);
      throw new Error(`Error checking for existing scores: ${queryError.message}`);
    }

    return existingScores?.[0];
  }

  static async updateScore(scoreId: number, score: Partial<GroupScore>) {
    try {
      console.log('Historizing and creating new score entry with:', score);
      
      // Historize the old entry and create a new one
      return await this.historizeAndCreate('group_scores', scoreId, {
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        judge_id: score.judgeId // Include the judge_id in the update
      });
    } catch (error) {
      console.error('Error updating group score:', error);
      throw new Error(`Error updating group score: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async createScore(score: Omit<GroupScore, 'id'>, judgeId: string) {
    const supabase = this.checkSupabaseClient();
    
    try {
      // First, archive ALL existing scores with the same combination
      // This is critical to avoid unique constraint violations
      await this.archiveAllExistingScores(score.groupId, score.tournamentId);
      
      // Add a small delay to ensure DB has processed the archive operation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now create the new score
      const { data, error } = await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: judgeId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating group score:', error);
        
        if (error.code === '23503') {
          throw new Error('Fehler: Ein referenzierter Datensatz (Gruppe oder Turnier) existiert nicht.');
        } else if (error.code === '23505') {
          // If we still hit a unique constraint, try one more time with a more aggressive approach
          await this.forceArchiveExistingScores(score.groupId, judgeId, score.tournamentId);
          
          // Try inserting again after forced archive
          const { data: retryData, error: retryError } = await supabase
            .from('group_scores')
            .insert([{
              group_id: score.groupId,
              judge_id: judgeId,
              whip_strikes: score.whipStrikes,
              rhythm: score.rhythm,
              tempo: score.tempo,
              time: score.time,
              tournament_id: score.tournamentId,
              record_type: 'C'
            }])
            .select()
            .single();
            
          if (retryError) {
            throw new Error('Fehler: Es existiert bereits eine Bewertung für diese Gruppe von diesem Richter. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.');
          }
          
          return retryData;
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
  
  // Archive all existing records for a group and tournament
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
  
  // More aggressive approach for handling specific constraint issues
  static async forceArchiveExistingScores(groupId: number, judgeId: string, tournamentId: number) {
    const supabase = this.checkSupabaseClient();
    
    try {
      console.log(`Force archiving specific scores for group ${groupId}, judge ${judgeId}, tournament ${tournamentId}`);
      
      // First - directly delete any records in error state that might be causing issues
      await supabase
        .from('group_scores')
        .delete()
        .eq('group_id', groupId)
        .eq('judge_id', judgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'E');
      
      // Then archive all current records for this specific combination
      const { error } = await supabase
        .from('group_scores')
        .update({ record_type: 'H' })
        .eq('group_id', groupId)
        .eq('judge_id', judgeId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (error) {
        console.error('Error in force archiving scores:', error);
        throw new Error(`Error force archiving scores: ${error.message}`);
      }
      
      // Add a delay to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error in forceArchiveExistingScores:', error);
      throw error;
    }
  }
}
