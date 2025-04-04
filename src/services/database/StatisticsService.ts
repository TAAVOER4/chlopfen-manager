
import { BaseService } from './BaseService';

export class StatisticsService extends BaseService {
  static async getParticipantStatistics() {
    try {
      const { data, error } = await this.supabase
        .from('participants')
        .select('category, count(*)')
        .group('category');
        
      if (error) {
        console.error('Error fetching participant statistics:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error loading participant statistics:', error);
      return [];
    }
  }
  
  static async getGroupStatistics() {
    try {
      const { data, error } = await this.supabase
        .from('groups')
        .select('category, count(*)')
        .group('category');
        
      if (error) {
        console.error('Error fetching group statistics:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error loading group statistics:', error);
      return [];
    }
  }
  
  static async getScoreStatistics() {
    try {
      // Get average scores by category
      const { data, error } = await this.supabase
        .from('individual_scores')
        .select(`
          id,
          whip_strikes,
          rhythm,
          stance,
          posture,
          whip_control,
          participants!individual_scores_participant_id_fkey (
            category
          )
        `);
        
      if (error) {
        console.error('Error fetching score statistics:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error loading score statistics:', error);
      return [];
    }
  }
}
