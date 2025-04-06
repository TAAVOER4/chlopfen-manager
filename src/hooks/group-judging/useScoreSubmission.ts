
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupScore, GroupCriterionKey } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { ScoreService } from '@/services/database/ScoreService';
import { useMutation } from '@tanstack/react-query';

export const useScoreSubmission = (
  groups: Group[],
  scores: Record<number, Partial<GroupScore>>,
  canEditCriterion: (criterion: GroupCriterionKey) => boolean
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, selectedTournament } = useUser();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Create mutation for saving scores
  const saveScoreMutation = useMutation({
    mutationFn: (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to mutation:', score);
      return ScoreService.createGroupScore(score);
    },
    onSuccess: () => {
      const currentGroup = groups[currentGroupIndex];
      if (!currentGroup) return;
      
      toast({
        title: "Bewertung gespeichert",
        description: `Die Bewertung für ${currentGroup.name} wurde gespeichert.`
      });
      
      // Move to next group or back to judging page
      if (currentGroupIndex < groups.length - 1) {
        setCurrentGroupIndex(prev => prev + 1);
      } else {
        navigate('/judging');
      }
    },
    onError: (error) => {
      console.error('Error saving score:', error);
      toast({
        title: "Fehler",
        description: "Die Bewertung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  const handleSaveScore = async () => {
    const currentGroup = groups[currentGroupIndex];
    if (!currentGroup || !currentUser?.id) return;
    
    const currentScore = scores[currentGroup.id];
    if (!currentScore) return;
    
    // Check if required fields are filled in
    const requiredFields = ['whipStrikes', 'rhythm', 'tempo'] as const;
    const missingFields = requiredFields.filter(field => 
      canEditCriterion(field) && (currentScore[field] === undefined || currentScore[field] === null)
    );
    
    if (missingFields.length > 0) {
      toast({
        title: "Fehlende Bewertungen",
        description: "Bitte geben Sie Bewertungen für alle Ihnen zugewiesenen Kriterien ein.",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare score data for saving
    const scoreData: Omit<GroupScore, 'id'> = {
      groupId: currentGroup.id,
      judgeId: currentUser.id,
      whipStrikes: currentScore.whipStrikes || 0,
      rhythm: currentScore.rhythm || 0,
      tempo: currentScore.tempo || 0,
      time: currentScore.time !== undefined ? currentScore.time : true,
      tournamentId: selectedTournament?.id || currentGroup.tournamentId
    };
    
    console.log('Saving score data:', scoreData);
    
    // Save score to database
    saveScoreMutation.mutate(scoreData);
  };

  return {
    currentGroupIndex,
    setCurrentGroupIndex,
    handleSaveScore
  };
};
