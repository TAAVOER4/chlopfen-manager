
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

  // Improved archive mutation with enhanced error handling and longer delays
  const archiveScoresMutation = useMutation({
    mutationFn: async ({ groupId, tournamentId }: { groupId: number, tournamentId: number }) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log(`Starting archiving process for group ${groupId}`);
      
      // Check for active scores first
      const activeScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
        groupId,
        String(currentUser.id),
        tournamentId
      );
      
      if (activeScores.length === 0) {
        console.log('No active scores found, no need to archive');
        return true;
      }
      
      console.log(`Found ${activeScores.length} active scores to archive`);
      
      // Try archiving multiple times with increasing delays
      let retryCount = 0;
      const maxRetries = 5; // Increased from 3
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Archive attempt ${retryCount + 1} for group ${groupId}`);
          
          // Force archive with direct DB call
          success = await GroupScoreService.forceArchiveScores(
            groupId,
            String(currentUser.id),
            tournamentId
          );

          if (success) {
            console.log('Archive operation successful');
            
            // Add a longer verification delay
            console.log('Waiting for database consistency...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay
            
            // Verify archiving worked
            const remainingScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
              groupId,
              String(currentUser.id),
              tournamentId
            );
            
            if (remainingScores.length > 0) {
              console.log(`Verification failed: ${remainingScores.length} scores still active`);
              success = false;
              throw new Error(`Verification failed: ${remainingScores.length} scores still active`);
            }
            
            console.log('Verification successful, all scores archived');
            return true;
          }
          
          // Increasing delay between retries
          const delay = 1500 + (retryCount * 500);
          console.log(`Archive attempt failed, waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
        } catch (error) {
          console.error(`Error during archive attempt ${retryCount + 1}:`, error);
          retryCount++;
          
          // Increasing delay after errors
          const delay = 2000 + (retryCount * 1000);
          console.log(`Error encountered, waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          if (retryCount === maxRetries) throw error;
        }
      }

      if (!success) {
        throw new Error('Die vorhandenen Bewertungen konnten nach mehreren Versuchen nicht archiviert werden.');
      }

      return success;
    }
  });

  // Completely revised save score mutation with strict sequencing
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

      // STEP 1: First archive existing scores with multiple retries
      console.log('Step 1: Archiving existing scores');
      try {
        const archived = await archiveScoresMutation.mutateAsync({
          groupId: scoreWithUser.groupId,
          tournamentId: scoreWithUser.tournamentId
        });

        if (!archived) {
          console.error('Archiving step failed');
          throw new Error('Die vorhandenen Bewertungen konnten nicht archiviert werden.');
        }
        
        console.log('Step 1 completed: Archiving successful');
      } catch (error) {
        console.error('Error during archiving step:', error);
        throw new Error(`Fehler beim Archivieren: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
      
      // STEP 2: Secondary verification to ensure DB consistency
      console.log('Step 2: Secondary verification of archive status');
      try {
        // Add additional delay to ensure database consistency
        console.log('Waiting for database synchronization...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const activeScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
          scoreWithUser.groupId,
          String(currentUser.id),
          scoreWithUser.tournamentId
        );
        
        if (activeScores.length > 0) {
          console.error(`Verification failed: ${activeScores.length} active scores still exist`);
          
          // Last-ditch attempt to manually archive each score
          console.log('Attempting manual archive of each remaining score...');
          let manualSuccess = true;
          
          for (const score of activeScores) {
            try {
              const archived = await GroupScoreService.archiveSingleScore(score.id);
              if (!archived) {
                manualSuccess = false;
                console.error(`Failed to manually archive score ID ${score.id}`);
              }
            } catch (err) {
              manualSuccess = false;
              console.error(`Error manually archiving score ID ${score.id}:`, err);
            }
            
            // Small delay between operations
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          if (!manualSuccess) {
            throw new Error('Die vorhandenen Bewertungen konnten nicht vollständig archiviert werden.');
          }
          
          // Final verification
          await new Promise(resolve => setTimeout(resolve, 1000));
          const finalCheck = await GroupScoreService.getActiveScoresForGroupAndJudge(
            scoreWithUser.groupId,
            String(currentUser.id),
            scoreWithUser.tournamentId
          );
          
          if (finalCheck.length > 0) {
            throw new Error(`Es sind noch ${finalCheck.length} aktive Bewertungen vorhanden. Bitte versuchen Sie es später erneut.`);
          }
        }
        
        console.log('Step 2 completed: No active scores remain');
      } catch (error) {
        console.error('Error during verification step:', error);
        throw new Error(`Fehler bei der Verifizierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }

      // STEP 3: Create the new score
      console.log('Step 3: Creating new score');
      try {
        const newScore = await GroupScoreService.createGroupScore(scoreWithUser);
        console.log('Step 3 completed: New score created successfully', newScore);
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
