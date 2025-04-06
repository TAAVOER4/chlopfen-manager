
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTournament } from '@/contexts/TournamentContext';

// Define statistics types
export type ParticipantStats = {
  total: number;
  individual: number;
  groupOnly: number;
  byCategory: Record<string, {
    total: number;
    individual: number;
    groupOnly: number;
  }>;
};

export type GroupStats = {
  total: number;
  bySize: {
    three: number;
    four: number;
  };
};

export const useDashboardStatistics = () => {
  const { activeTournament } = useTournament();
  const [isLoading, setIsLoading] = useState(true);
  const [participantStats, setParticipantStats] = useState<ParticipantStats>({
    total: 0,
    individual: 0,
    groupOnly: 0,
    byCategory: {}
  });
  const [groupStats, setGroupStats] = useState<GroupStats>({
    total: 0,
    bySize: {
      three: 0,
      four: 0
    }
  });

  // Fetch statistics directly using Supabase
  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      
      try {
        // Get participant statistics
        const participantQuery = supabase
          .from('participants')
          .select('category, is_group_only');
          
        // Filter by tournament if one is active
        if (activeTournament?.id) {
          participantQuery.eq('tournament_id', activeTournament.id);
        }
          
        const { data: participantData, error: participantError } = await participantQuery;
        
        if (participantError) {
          console.error('Error fetching participant statistics:', participantError);
          throw participantError;
        }
        
        // Process participant data
        const participantStats: ParticipantStats = {
          total: 0,
          individual: 0,
          groupOnly: 0,
          byCategory: {}
        };
        
        participantData?.forEach(participant => {
          const category = participant.category;
          const isGroupOnly = participant.is_group_only || false;
          
          // Initialize category if it doesn't exist
          if (!participantStats.byCategory[category]) {
            participantStats.byCategory[category] = {
              total: 0,
              individual: 0,
              groupOnly: 0
            };
          }
          
          // Update total counts
          participantStats.total++;
          participantStats.byCategory[category].total++;
          
          // Update individual/groupOnly counts
          if (isGroupOnly) {
            participantStats.groupOnly++;
            participantStats.byCategory[category].groupOnly++;
          } else {
            participantStats.individual++;
            participantStats.byCategory[category].individual++;
          }
        });
        
        setParticipantStats(participantStats);
        
        // Get group statistics
        const groupQuery = supabase
          .from('groups')
          .select('size');
          
        // Filter by tournament if one is active
        if (activeTournament?.id) {
          groupQuery.eq('tournament_id', activeTournament.id);
        }
          
        const { data: groupData, error: groupError } = await groupQuery;
        
        if (groupError) {
          console.error('Error fetching group statistics:', groupError);
          throw groupError;
        }
        
        // Process group data
        const groupStats: GroupStats = {
          total: 0,
          bySize: {
            three: 0,
            four: 0
          }
        };
        
        groupData?.forEach(group => {
          groupStats.total++;
          
          if (group.size === 'three') {
            groupStats.bySize.three++;
          } else if (group.size === 'four') {
            groupStats.bySize.four++;
          }
        });
        
        setGroupStats(groupStats);
        
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, [activeTournament]);

  return {
    isLoading,
    participantStats,
    groupStats
  };
};
