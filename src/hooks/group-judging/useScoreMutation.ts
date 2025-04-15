
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

  // Archive mutation with retries
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
          
          // Versuch die Scores zu archivieren
          success = await GroupScoreService.forceArchiveScores(
            groupId,
            String(currentUser.id),
            tournamentId
          );

          if (success) {
            console.log('Archivierung erfolgreich');
            return true;
          }

          // Wenn nicht erfolgreich, warten wir kurz vor dem nächsten Versuch
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
        } catch (error) {
          console.error(`Fehler beim Archivierungsversuch ${retryCount + 1}:`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
        }
      }

      if (!success) {
        throw new Error('Die vorhandenen Bewertungen konnten nach mehreren Versuchen nicht archiviert werden.');
      }

      return success;
    }
  });

  // Save score mutation with synchronized archiving
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

      // Erst archivieren
      const archived = await archiveScoresMutation.mutateAsync({
        groupId: scoreWithUser.groupId,
        tournamentId: scoreWithUser.tournamentId
      });

      if (!archived) {
        throw new Error('Archivierung fehlgeschlagen');
      }

      // Kurze Pause für Datenbanksynchrosisation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dann neue Bewertung erstellen
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
