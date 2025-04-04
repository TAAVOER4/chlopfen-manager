
import { BaseService } from './BaseService';

export class StatisticsService extends BaseService {
  static async getParticipantStatistics() {
    try {
      const { data, error } = await this.supabase
        .from('participants')
        .select('category')
        .then(result => {
          // Group by category manually
          if (result.error) throw result.error;
          
          const categories: Record<string, number> = {};
          result.data?.forEach(participant => {
            categories[participant.category] = (categories[participant.category] || 0) + 1;
          });
          
          return {
            data: Object.entries(categories).map(([category, count]) => ({ category, count })),
            error: null
          };
        });
        
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
        .select('category')
        .then(result => {
          // Group by category manually
          if (result.error) throw result.error;
          
          const categories: Record<string, number> = {};
          result.data?.forEach(group => {
            categories[group.category] = (categories[group.category] || 0) + 1;
          });
          
          return {
            data: Object.entries(categories).map(([category, count]) => ({ category, count })),
            error: null
          };
        });
        
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

  // For compatibility with DatabaseService methods
  static async getIndividualResults() {
    return this.getScoreStatistics();
  }

  static async getGroupResults() {
    return this.getGroupStatistics();
  }
}
