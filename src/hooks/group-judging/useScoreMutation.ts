
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

  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      console.log('Starting score mutation with a completely new approach');
      
      // Create the score object with the current user's ID
      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };
      
      try {
        // Add clear log markers to track the flow
        console.log('==== SCORE SAVE PROCESS START ====');
        console.log('First step: Check if there are existing scores to archive');
        
        // Step 1: First check if there are any active scores
        const activeScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
          scoreWithUser.groupId, 
          String(currentUser.id), 
          scoreWithUser.tournamentId
        );
        
        console.log(`Found ${activeScores.length} active scores to archive`);
        
        // Step 2: If there are active scores, archive them one by one
        if (activeScores.length > 0) {
          console.log('Archiving each existing score individually');
          
          for (const activeScore of activeScores) {
            console.log(`Archiving score with ID: ${activeScore.id}`);
            await GroupScoreService.archiveSingleScore(activeScore.id);
            
            // Add a small delay between operations to ensure database consistency
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Verify all scores were archived
          const remainingScores = await GroupScoreService.getActiveScoresForGroupAndJudge(
            scoreWithUser.groupId, 
            String(currentUser.id), 
            scoreWithUser.tournamentId
          );
          
          if (remainingScores.length > 0) {
            console.error('Failed to archive all scores:', remainingScores);
            throw new Error('Die vorhandenen Bewertungen konnten nicht vollständig historisiert werden.');
          }
          
          console.log('All existing scores were successfully archived');
          
          // Wait a bit longer after archiving to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Step 3: Now that we've confirmed all scores are archived, create the new score
        console.log('Creating new score after confirming no active scores exist');
        const result = await GroupScoreService.createGroupScore(scoreWithUser);
        
        console.log('==== SCORE SAVE PROCESS COMPLETE ====');
        console.log('Score saved successfully:', result);
        return result;
      } catch (error) {
        console.error('==== SCORE SAVE PROCESS FAILED ====');
        console.error('Error in saveScoreMutation:', error);
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
