
import { useState, useEffect } from 'react';
import { Group, GroupScore, GroupCriterionKey } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';

export const useGroupScores = (groups: Group[]) => {
  const { currentUser, selectedTournament, isAdmin, isJudge } = useUser();
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});
  
  // Check if user is authorized to submit scores
  const canEditScores = isAdmin || isJudge;

  // Fetch existing scores for the current user
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

  // Initialize scores for each group
  useEffect(() => {
    if (groups.length === 0 || !currentUser) return;

    console.log('Initializing scores for groups:', groups.length, 'User:', currentUser.id);
    console.log('Existing scores:', existingScores?.length || 0);
    
    // Initialize scores for each group with empty values
    const initialScores: Record<number, Partial<GroupScore>> = {};
    
    groups.forEach(group => {
      // Convert to string for comparison
      const judgeId = String(currentUser.id);
      
      // Look for an existing score for this group by this judge
      const existingScore = existingScores?.find(score => {
        return score.groupId === group.id && 
               String(score.judgeId) === judgeId;
      });
      
      console.log('Checking for existing score for group:', group.id, 'Judge:', judgeId);
      if (existingScore) {
        console.log('Found existing score:', existingScore);
        initialScores[group.id] = existingScore;
      } else {
        initialScores[group.id] = {
          groupId: group.id,
          judgeId,
          whipStrikes: undefined,
          rhythm: undefined,
          tempo: undefined,
          time: true,
          tournamentId: selectedTournament?.id || group.tournamentId
        };
      }
    });
    
    console.log('Setting initial scores:', initialScores);
    setScores(initialScores);
  }, [groups, currentUser, selectedTournament, existingScores, isAdmin]);

  // Determine if current user can edit a specific criterion
  const canEditCriterion = (criterion: GroupCriterionKey): boolean => {
    // If the user is not allowed to edit scores at all, return false
    if (!canEditScores) return false;
    
    // Admins can edit all criteria
    if (isAdmin) return true;
    
    // Judges can only edit their assigned criterion
    return currentUser?.assignedCriteria?.group === criterion;
  };

  const handleScoreChange = (groupId: number, criterion: keyof Omit<GroupScore, 'groupId' | 'judgeId' | 'time'>, value: number) => {
    // If the user is not allowed to edit scores, don't allow changes
    if (!canEditScores) return;
    
    // If the user is not authorized to edit this specific criterion, don't allow changes
    if (!canEditCriterion(criterion as GroupCriterionKey)) return;
    
    // Clamp value between 1 and 10
    const clampedValue = Math.max(1, Math.min(10, value));
    
    setScores(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [criterion]: clampedValue
      }
    }));
  };

  return {
    scores,
    canEditCriterion,
    handleScoreChange,
    canEditScores,
    isLoadingScores
  };
};
