
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupScore, GroupCriterionKey } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useMutation } from '@tanstack/react-query';

export const useScoreSubmission = (
  groups: Group[],
  scores: Record<number, Partial<GroupScore>>,
  canEditCriterion: (criterion: GroupCriterionKey) => boolean,
  handleError: (error: unknown, context: string) => string
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, selectedTournament, isAdmin, isJudge } = useUser();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is authorized to submit scores
  const canSubmitScores = isAdmin || isJudge;

  // Create mutation for saving scores
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!canSubmitScores) {
        throw new Error('Sie sind nicht berechtigt, Bewertungen zu speichern');
      }
      
      console.log('Submitting score to database:', score);
      return await GroupScoreService.createGroupScore(score);
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
    onError: (error: any) => {
      console.error('Error saving score:', error);
      
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Die Bewertung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
      
      setIsSaving(false);
    }
  });

  const handleSaveScore = async () => {
    if (isSaving) return;
    
    // Check if user has permission to save scores
    if (!canSubmitScores) {
      toast({
        title: "Zugriff verweigert",
        description: "Sie sind nicht berechtigt, Bewertungen zu speichern.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (!groups.length) {
        throw new Error("Keine Gruppen gefunden");
      }
      
      const currentGroup = groups[currentGroupIndex];
      if (!currentGroup || !currentUser?.id) {
        throw new Error("Fehlende Gruppen- oder Benutzerinformationen");
      }
      
      const currentScore = scores[currentGroup.id];
      if (!currentScore) {
        throw new Error("Keine Bewertungsdaten für diese Gruppe gefunden");
      }
      
      // Check if required fields are filled in for current judge's criteria
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
        throw new Error("Kein Turnier ausgewählt");
      }

      // Convert ID to string format (required by database)
      const judgeId = typeof currentUser.id === 'string'
        ? currentUser.id // Already a string
        : String(currentUser.id); // Convert number to string
      
      console.log('User ID being used:', judgeId, 'Type:', typeof judgeId);

      // Prepare score data for saving
      const scoreData: Omit<GroupScore, 'id'> = {
        groupId: currentGroup.id,
        judgeId,
        whipStrikes: canEditCriterion('whipStrikes') ? currentScore.whipStrikes : null,
        rhythm: canEditCriterion('rhythm') ? currentScore.rhythm : null,
        tempo: canEditCriterion('tempo') ? currentScore.tempo : null,
        time: currentScore.time !== undefined ? currentScore.time : true,
        tournamentId: tournamentId
      };
      
      console.log('Saving score data:', scoreData);
      
      // Save score to database
      saveScoreMutation.mutate(scoreData);
    } catch (error) {
      console.error('Error preparing score submission:', error);
      
      toast({
        title: "Fehler bei der Bewertung",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      });
      
      setIsSaving(false);
    }
  };

  return {
    currentGroupIndex,
    setCurrentGroupIndex,
    handleSaveScore,
    isSaving,
    canSubmitScores
  };
};
