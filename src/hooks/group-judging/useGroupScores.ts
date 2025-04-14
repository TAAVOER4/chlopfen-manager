
import { useState, useEffect } from 'react';
import { Group, GroupScore, GroupCriterionKey } from '../../types';
import { useUser } from '@/contexts/UserContext';

export const useGroupScores = (groups: Group[]) => {
  const { currentUser, selectedTournament, isAdmin, isJudge } = useUser();
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});
  
  // Check if user is authorized to submit scores
  const canEditScores = isAdmin || isJudge;

  // Initialize scores for each group
  useEffect(() => {
    if (groups.length === 0 || !currentUser) return;

    // Initialize scores for each group with empty values
    const initialScores: Record<number, Partial<GroupScore>> = {};
    groups.forEach(group => {
      // For user ID, we need to ensure it's in a valid UUID format for the database
      // If it's a mock user with numeric ID, we'll generate a UUID-like string
      let judgeId: string;
      
      if (typeof currentUser.id === 'string' && currentUser.id.includes('-')) {
        // Already a UUID format
        judgeId = currentUser.id;
      } else {
        // Generate a simple UUID-like string (not a true UUID but valid format)
        // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is any hex digit and y is 8, 9, A, or B
        const userId = String(currentUser.id);
        judgeId = `00000000-0000-4000-a000-${userId.padStart(12, '0')}`;
      }
      
      initialScores[group.id] = {
        groupId: group.id,
        judgeId,
        whipStrikes: undefined,
        rhythm: undefined,
        tempo: undefined,
        time: true,
        tournamentId: selectedTournament?.id || group.tournamentId
      };
    });
    
    setScores(initialScores);
  }, [groups, currentUser, selectedTournament]);

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
    canEditScores
  };
};
