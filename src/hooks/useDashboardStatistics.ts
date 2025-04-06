
import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/DatabaseService';
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

  // Fetch statistics from database
  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      try {
        const [participantData, groupData] = await Promise.all([
          DatabaseService.getParticipantStatistics(),
          DatabaseService.getGroupStatistics()
        ]);
        
        setParticipantStats(participantData);
        setGroupStats(groupData);
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
