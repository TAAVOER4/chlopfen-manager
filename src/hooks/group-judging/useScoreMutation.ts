
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';

export const useScoreMutation = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();

  const { data: existingScores, refetch: refetchScores } = useQuery({
    queryKey: ['groupScores', currentUser?.id],
    queryFn: async () => {
      try {
        if (!currentUser?.id) return [];
        return await GroupScoreService.getGroupScores();
      } catch (error) {
        console.error('Error fetching existing scores:', error);
        return [];
      }
    },
    enabled: !!currentUser?.id
  });

  // Add a separate mutation just for archiving scores
  const archiveScoresMutation = useMutation({
    mutationFn: async ({ groupId, tournamentId }: { groupId: number, tournamentId: number }) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log('Starting archive operation for group:', groupId);
      
      // First, ensure all existing scores are archived
      const success = await GroupScoreService.forceArchiveScores(
        groupId, 
        String(currentUser.id),
        tournamentId
      );
      
      console.log('Archive operation completed with result:', success);
      
      if (!success) {
        throw new Error('Die vorhandenen Bewertungen konnten nicht historisiert werden.');
      }
      
      return success;
    }
  });

  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log('Starting score mutation with two-step approach');
      
      // Create the score object with the current user's ID
      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };
      
      try {
        // STEP 1: First, ensure all existing active scores are archived
        console.log('STEP 1: Archiving all existing active scores');
        await archiveScoresMutation.mutateAsync({
          groupId: scoreWithUser.groupId,
          tournamentId: scoreWithUser.tournamentId
        });
        
        // Add a delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // STEP 2: Create the new score after confirming archiving is complete
        console.log('STEP 2: Creating new score');
        const result = await GroupScoreService.createGroupScore(scoreWithUser);
        
        console.log('Score save process completed successfully');
        return result;
      } catch (error) {
        console.error('Score save process failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetchScores();
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Bewertung wurde erfolgreich gespeichert und historisiert.",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler beim Speichern der Bewertung",
        variant: "destructive"
      });
      refetchScores();
    }
  });

  return {
    saveScoreMutation,
    existingScores,
    refetchScores
  };
};
