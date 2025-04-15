
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';

export const useScoreMutation = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();

  // Fetch existing scores query
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

  // Archive scores mutation - separate from the save operation
  const archiveScoresMutation = useMutation({
    mutationFn: async ({ groupId, tournamentId }: { groupId: number, tournamentId: number }) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log(`Explicitly archiving scores for group ${groupId}, tournament ${tournamentId}`);
      
      // First try to use a separate archiving operation
      const archived = await GroupScoreService.forceArchiveScores(
        groupId,
        String(currentUser.id),
        tournamentId
      );
      
      console.log(`Archive operation result: ${archived ? 'success' : 'failed'}`);
      
      return archived;
    },
    onError: (error) => {
      console.error('Error during archive operation:', error);
      // Don't show toast for archive errors, just log them
    }
  });

  // Save score mutation
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }

      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };

      console.log('Starting score save process...');
      
      // First explicitly archive existing scores
      try {
        await archiveScoresMutation.mutateAsync({
          groupId: score.groupId,
          tournamentId: score.tournamentId
        });
      } catch (archiveError) {
        console.error('Error during explicit archive step:', archiveError);
        // Continue with creation anyway
      }
      
      // Create the new score
      return await GroupScoreService.createGroupScore(scoreWithUser);
    },
    onSuccess: () => {
      refetchScores();
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Bewertung wurde erfolgreich gespeichert.",
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
    archiveScoresMutation,
    existingScores,
    refetchScores
  };
};
