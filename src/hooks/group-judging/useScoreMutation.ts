
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

  // Archive mutation with retries and more robust error handling
  const archiveScoresMutation = useMutation({
    mutationFn: async ({ groupId, tournamentId }: { groupId: number, tournamentId: number }) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Archivierungsversuch ${retryCount + 1} für Gruppe ${groupId}`);
          
          // Directly call the DB service to ensure we bypass any caching
          success = await GroupScoreService.forceArchiveScores(
            groupId,
            String(currentUser.id),
            tournamentId
          );

          if (success) {
            console.log('Archivierung erfolgreich');
            return true;
          }

          // Slightly longer delay before retry
          await new Promise(resolve => setTimeout(resolve, 1500));
          retryCount++;
        } catch (error) {
          console.error(`Fehler beim Archivierungsversuch ${retryCount + 1}:`, error);
          retryCount++;
          
          // Add a longer delay after errors
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (retryCount === maxRetries) throw error;
        }
      }

      if (!success) {
        throw new Error('Die vorhandenen Bewertungen konnten nach mehreren Versuchen nicht archiviert werden.');
      }

      return success;
    }
  });

  // Improved save score mutation with more robust synchronization
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }

      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };

      console.log('Starte Speichervorgang mit Archivierung...');

      // Step 1: Force archiving of all existing scores with retries
      const archived = await archiveScoresMutation.mutateAsync({
        groupId: scoreWithUser.groupId,
        tournamentId: scoreWithUser.tournamentId
      });

      if (!archived) {
        throw new Error('Archivierung fehlgeschlagen');
      }

      // Step 2: Add a longer synchronization delay to ensure DB consistency
      console.log('Warte auf Datenbanksynchrosisation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Double-check that scores were actually archived before proceeding
      const activeScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
        scoreWithUser.groupId,
        String(currentUser.id),
        scoreWithUser.tournamentId
      );

      if (activeScores.length > 0) {
        console.error('Es sind noch aktive Bewertungen vorhanden:', activeScores.length);
        throw new Error('Die vorhandenen Bewertungen konnten nicht vollständig archiviert werden. Bitte versuchen Sie es später erneut.');
      }

      // Step 4: Create the new score after confirming no active scores exist
      console.log('Erstelle neue Bewertung nach erfolgreicher Archivierung');
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
    existingScores,
    refetchScores
  };
};
