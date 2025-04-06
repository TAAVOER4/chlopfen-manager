
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
  canEditCriterion: (criterion: GroupCriterionKey) => boolean,
  handleError: (error: unknown, context: string) => string
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, selectedTournament } = useUser();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Create mutation for saving scores
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to database:', score);
      return await ScoreService.createGroupScore(score);
    },
    onSuccess: (data) => {
      console.log('Score saved successfully:', data);
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
      
      setIsSaving(false);
    },
    onError: (error) => {
      handleError(error, 'Fehler beim Speichern der Bewertung');
      setIsSaving(false);
    }
  });

  const handleSaveScore = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    if (!groups.length) {
      handleError(new Error("Keine Gruppen gefunden"), "Bewertung Validierung");
      setIsSaving(false);
      return;
    }
    
    const currentGroup = groups[currentGroupIndex];
    if (!currentGroup || !currentUser?.id) {
      handleError(new Error("Fehlende Gruppen- oder Benutzerinformationen"), "Bewertung Validierung");
      setIsSaving(false);
      return;
    }
    
    const currentScore = scores[currentGroup.id];
    if (!currentScore) {
      handleError(new Error("Keine Bewertungsdaten für diese Gruppe gefunden"), "Bewertung Validierung");
      setIsSaving(false);
      return;
    }
    
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
      setIsSaving(false);
      return;
    }
    
    // Prepare score data for saving
    const tournamentId = selectedTournament?.id || currentGroup.tournamentId;
    if (!tournamentId) {
      handleError(new Error("Kein Turnier ausgewählt"), "Bewertung Validierung");
      setIsSaving(false);
      return;
    }

    // Make sure judgeId is sent as a string (UUID format)
    // Ensure that judgeId is a proper UUID format string, not a number
    const judgeId = currentUser.id.toString();
    
    console.log('Judge ID being used:', judgeId, 'Type:', typeof judgeId);

    // Prepare score data for saving
    const scoreData: Omit<GroupScore, 'id'> = {
      groupId: currentGroup.id,
      judgeId: judgeId,
      whipStrikes: currentScore.whipStrikes !== undefined ? currentScore.whipStrikes : null,
      rhythm: currentScore.rhythm !== undefined ? currentScore.rhythm : null,
      tempo: currentScore.tempo !== undefined ? currentScore.tempo : null,
      time: currentScore.time !== undefined ? currentScore.time : true,
      tournamentId: tournamentId
    };
    
    console.log('Saving score data:', scoreData);
    
    // Save score to database
    saveScoreMutation.mutate(scoreData);
  };

  return {
    currentGroupIndex,
    setCurrentGroupIndex,
    handleSaveScore,
    isSaving
  };
};
