
import { useState } from 'react';
import { Group, GroupScore, GroupCriterionKey } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { useScoresInitialization } from './useScoresInitialization';
import { useEditPermissions } from './useEditPermissions';
import { useScoreManagement } from './useScoreManagement';

export const useGroupScores = (groups: Group[]) => {
  const { currentUser } = useUser();
  
  const { data: existingScores, isLoading: isLoadingScores } = useQuery({
    queryKey: ['groupScores', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      try {
        const allScores = await GroupScoreService.getGroupScores();
        console.log('Fetched all scores:', allScores);
        return allScores;
      } catch (error) {
        console.error('Error fetching group scores:', error);
        return [];
      }
    },
    enabled: !!currentUser?.id
  });

  const { scores, setScores } = useScoresInitialization(groups, existingScores);
  const { canEditScores, canEditCriterion } = useEditPermissions();
  const { handleScoreChange } = useScoreManagement(scores, setScores, canEditCriterion);

  return {
    scores,
    canEditCriterion,
    handleScoreChange,
    canEditScores,
    isLoadingScores
  };
};
