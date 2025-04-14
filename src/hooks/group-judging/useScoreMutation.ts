
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';

export const useScoreMutation = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();

  // Query for existing scores
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

  // Mutation for saving scores
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to database:', score);
      
      // Force a refetch first to get the latest state
      await refetchScores();
      
      try {
        // Attempt to create or update the score
        return await GroupScoreService.createOrUpdateGroupScore(score);
      } catch (error) {
        console.error('Error in score mutation:', error);
        
        // If there's a unique constraint error or an archiving error, we handle it specially
        if (error instanceof Error && 
            (error.message.includes('unique constraint') || 
             error.message.includes('bereits eine Bewertung'))) {
          console.log('Handling constraint error in mutation');
          
          // Force another refetch to get the latest state
          await refetchScores();
          
          // Rethrow with a more user-friendly message
          throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.');
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      refetchScores();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      refetchScores();
    }
  });

  return {
    saveScoreMutation,
    existingScores,
    refetchScores
  };
};
