
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

  // Archive scores mutation
  const archiveScoresMutation = useMutation({
    mutationFn: async ({ groupId, tournamentId }: { groupId: number, tournamentId: number }) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log(`Starting archiving process for group ${groupId}`);
      
      // Force archive with direct DB call
      return await GroupScoreService.forceArchiveScores(
        groupId,
        String(currentUser.id),
        tournamentId
      );
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

      console.log('Starting score save process with archiving...');
      console.log('Score data:', scoreWithUser);

      try {
        // Create the new score directly - the DB service will handle archiving
        const newScore = await GroupScoreService.createGroupScore(scoreWithUser);
        console.log('Successfully created new score:', newScore);
        return newScore;
      } catch (error) {
        console.error('Error creating new score:', error);
        throw new Error(`Fehler beim Erstellen der neuen Bewertung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
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
    existingScores,
    refetchScores
  };
};
