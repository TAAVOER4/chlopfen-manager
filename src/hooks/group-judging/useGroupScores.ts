
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
      let judgeId: string;
      
      const userId = String(currentUser.id); // Ensure we have a string
      
      // Check if it contains hyphens (likely a UUID already)
      if (userId && userId.includes('-') && userId.length === 36) {
        // Already a UUID format
        judgeId = userId;
      } else {
        // Generate a proper UUID format (using the actual UUID from the mockJudges data)
        // This is a temporary solution for the demo - in real app we'd query the users table
        let mockUserUuid = '';
        
        if (userId === '1') {
          // Hans Müller (admin)
          mockUserUuid = 'f5b2c3a7-1e5d-4839-a7dd-1c25f4b3a74f';
        } else if (userId === '2') {
          // Maria Schmidt (judge - rhythm)
          mockUserUuid = 'a1b2c3d4-e5f6-4a3b-8c9d-0e1f2a3b4c5d';
        } else if (userId === '3') {
          // Peter Meier (judge - whipStrikes)
          mockUserUuid = 'b2c3d4e5-f6a7-4b3c-9d0e-1f2a3b4c5d6e';
        } else if (userId === '4') {
          // Anna Weber (judge - stance)
          mockUserUuid = 'c3d4e5f6-a7b8-4c3d-0e1f-2a3b4c5d6e7f';
        } else if (userId === '5') {
          // Stefan Keller (judge - posture)
          mockUserUuid = 'd4e5f6a7-b8c9-4d3e-1f2a-3b4c5d6e7f8a';
        } else if (userId === '6') {
          // Lisa Schmid (judge - tempo)
          mockUserUuid = 'e5f6a7b8-c9d0-4e3f-2a3b-4c5d6e7f8a9b';
        } else if (userId === '7') {
          // Thomas Brunner (judge - whipControl)
          mockUserUuid = 'f6a7b8c9-d0e1-4f3a-3b4c-5d6e7f8a9b0c';
        } else if (userId === '8') {
          // Erwin Vogel (admin)
          mockUserUuid = 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d';
        } else if (userId === '9') {
          // Christina Huber (reader)
          mockUserUuid = 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e';
        } else if (userId === '10') {
          // Michael Wagner (editor)
          mockUserUuid = 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f';
        } else {
          // Generate a fallback UUID if none matches
          mockUserUuid = `00000000-0000-4000-a000-${userId.padStart(12, '0')}`;
        }
        
        judgeId = mockUserUuid;
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
