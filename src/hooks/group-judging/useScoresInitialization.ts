
import { useState, useEffect } from 'react';
import { Group, GroupScore } from '@/types';
import { useUser } from '@/contexts/UserContext';

export const useScoresInitialization = (
  groups: Group[],
  existingScores: GroupScore[] | undefined
) => {
  const { currentUser, selectedTournament, isAdmin } = useUser();
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});

  useEffect(() => {
    if (groups.length === 0 || !currentUser) return;

    console.log('Initializing scores for groups:', groups.length, 'User:', currentUser.id);
    console.log('Existing scores:', existingScores?.length || 0);
    
    const initialScores: Record<number, Partial<GroupScore>> = {};
    
    groups.forEach(group => {
      // Find score for this group, filtering by active ('C') records
      const existingScore = existingScores?.find(
        score => score.groupId === group.id && score.tournamentId === (selectedTournament?.id || group.tournamentId)
      );
      
      console.log('Checking scores for group:', group.id);
      console.log('Found existing score:', existingScore);
      
      if (existingScore) {
        const filteredScore: Partial<GroupScore> = {
          groupId: group.id,
          judgeId: String(currentUser.id),
          time: true,
          tournamentId: selectedTournament?.id || group.tournamentId
        };
        
        if (isAdmin || currentUser.assignedCriteria?.group === 'whipStrikes') {
          filteredScore.whipStrikes = existingScore.whipStrikes;
        }
        if (isAdmin || currentUser.assignedCriteria?.group === 'rhythm') {
          filteredScore.rhythm = existingScore.rhythm;
        }
        if (isAdmin || currentUser.assignedCriteria?.group === 'tempo') {
          filteredScore.tempo = existingScore.tempo;
        }
        
        initialScores[group.id] = filteredScore;
      } else {
        initialScores[group.id] = {
          groupId: group.id,
          judgeId: String(currentUser.id),
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

  return { scores, setScores };
};
