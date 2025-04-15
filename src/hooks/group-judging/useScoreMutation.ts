
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
      
      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };
      
      try {
        console.log('Saving score with data:', scoreWithUser);
        
        // Attempt to save the score
        const result = await GroupScoreService.createGroupScore(scoreWithUser);
        
        console.log('Score saved successfully:', result);
        return result;
      } catch (error) {
        console.error('Error saving score:', error);
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
