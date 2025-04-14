
import { Group, GroupScore, GroupCriterionKey } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useSubmissionState } from './useSubmissionState';
import { useScoreValidation } from './useScoreValidation';
import { useScoreMutation } from './useScoreMutation';

export const useScoreSubmission = (
  groups: Group[],
  scores: Record<number, Partial<GroupScore>>,
  canEditCriterion: (criterion: GroupCriterionKey) => boolean,
  handleError: (error: unknown, context: string) => string
) => {
  const { toast } = useToast();
  const { currentUser, selectedTournament } = useUser();
  const { 
    currentGroupIndex, 
    setCurrentGroupIndex, 
    isSaving, 
    setIsSaving,
    canSubmitScores,
    navigate 
  } = useSubmissionState();
  
  const { validateScore } = useScoreValidation(canEditCriterion);
  const { saveScoreMutation, existingScores } = useScoreMutation();

  const handleSaveScore = async () => {
    if (isSaving) return;
    
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
      if (!currentGroup) {
        throw new Error("Fehlende Gruppeninformationen");
      }
      
      if (!currentUser?.id) {
        throw new Error("Fehlende Benutzerinformationen");
      }
      
      const currentScore = scores[currentGroup.id];
      if (!currentScore) {
        throw new Error("Keine Bewertungsdaten für diese Gruppe gefunden");
      }

      // Validate score before saving
      if (!validateScore(currentScore, currentGroup.name)) {
        setIsSaving(false);
        return;
      }

      const tournamentId = selectedTournament?.id || currentGroup.tournamentId;
      if (!tournamentId) {
        throw new Error("Kein Turnier ausgewählt");
      }
      
      // Save score to database
      await saveScoreMutation.mutateAsync({
        groupId: currentGroup.id,
        judgeId: String(currentUser.id),
        whipStrikes: currentScore.whipStrikes,
        rhythm: currentScore.rhythm,
        tempo: currentScore.tempo,
        time: currentScore.time !== undefined ? currentScore.time : true,
        tournamentId: tournamentId
      });
      
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
    } catch (error) {
      const errorMessage = handleError(error, "Fehler beim Speichern der Bewertung");
      toast({
        title: "Fehler beim Speichern",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentGroupIndex,
    setCurrentGroupIndex,
    handleSaveScore,
    isSaving,
    canSubmitScores,
    existingScores
  };
};
