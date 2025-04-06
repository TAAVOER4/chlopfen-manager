
import { BaseService } from './BaseService';
import { supabase } from '@/integrations/supabase/client';

export class StatisticsService extends BaseService {
  static async getParticipantStatistics() {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('category, is_group_only');
        
      if (error) {
        console.error('Error fetching participant statistics:', error);
        throw error;
      }
      
      // Initialize statistics object with default values
      const statistics = {
        total: 0,
        individual: 0,
        groupOnly: 0,
        byCategory: {} as Record<string, {
          total: number;
          individual: number;
          groupOnly: number;
        }>
      };
      
      // Process participant data
      data?.forEach(participant => {
        const category = participant.category;
        const isGroupOnly = participant.is_group_only || false;
        
        // Initialize category if it doesn't exist
        if (!statistics.byCategory[category]) {
          statistics.byCategory[category] = {
            total: 0,
            individual: 0,
            groupOnly: 0
          };
        }
        
        // Update total counts
        statistics.total++;
        statistics.byCategory[category].total++;
        
        // Update individual/groupOnly counts
        if (isGroupOnly) {
          statistics.groupOnly++;
          statistics.byCategory[category].groupOnly++;
        } else {
          statistics.individual++;
          statistics.byCategory[category].individual++;
        }
      });
      
      return statistics;
    } catch (error) {
      console.error('Error loading participant statistics:', error);
      return {
        total: 0,
        individual: 0,
        groupOnly: 0,
        byCategory: {}
      };
    }
  }
  
  static async getGroupStatistics() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('size');
        
      if (error) {
        console.error('Error fetching group statistics:', error);
        throw error;
      }
      
      // Initialize group statistics
      const statistics = {
        total: 0,
        bySize: {
          three: 0,
          four: 0
        }
      };
      
      // Process group data
      data?.forEach(group => {
        statistics.total++;
        
        if (group.size === 'three') {
          statistics.bySize.three++;
        } else if (group.size === 'four') {
          statistics.bySize.four++;
        }
      });
      
      return statistics;
    } catch (error) {
      console.error('Error loading group statistics:', error);
      return {
        total: 0,
        bySize: {
          three: 0,
          four: 0
        }
      };
    }
  }
  
  static async getScoreStatistics() {
    try {
      // Get average scores by category
      const { data, error } = await supabase
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
