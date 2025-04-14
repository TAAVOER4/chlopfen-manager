
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

      // For user ID, ensure it's in a valid UUID format
      let judgeId: string;
      
      const userId = String(currentUser.id); // Convert to string explicitly
      
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
