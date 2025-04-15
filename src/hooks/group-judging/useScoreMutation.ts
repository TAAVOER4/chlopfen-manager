
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
      
      // Add more debugging information
      console.log('Starting score mutation:', { 
        groupId: score.groupId,
        judgeId: currentUser.id, 
        tournamentId: score.tournamentId 
      });
      
      // Create the score object with the current user's ID
      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };
      
      try {
        // First, explicitly archive any existing scores
        console.log('First step: Forcing archive of existing scores');
        const archiveResult = await GroupScoreService.forceArchiveScores(
          scoreWithUser.groupId, 
          String(currentUser.id), 
          scoreWithUser.tournamentId
        );
        
        console.log('Archive result:', archiveResult);
        
        // Add a small wait after archiving to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Now attempt to save the new score
        console.log('Second step: Creating new score after archiving');
        const result = await GroupScoreService.createGroupScore(scoreWithUser);
        
        console.log('Score saved successfully:', result);
        return result;
      } catch (error) {
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
