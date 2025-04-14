
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';

export const useScoreMutation = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();

  // Query for existing scores with better error handling
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

  // Mutation for saving scores with improved handling of constraint errors
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to database:', score);
      
      // Always force a refetch first to get the latest state before mutation
      await refetchScores();
      
      try {
        // Attempt to create or update the score
        const result = await GroupScoreService.createOrUpdateGroupScore(score);
        return result;
      } catch (error) {
        console.error('Error in score mutation:', error);
        
        // Handle constraint errors specially
        if (error instanceof Error && 
            (error.message.includes('unique constraint') || 
             error.message.includes('bereits eine Bewertung'))) {
          console.log('Handling constraint error in mutation');
          
          // Force another refetch to update UI with latest state
          await refetchScores();
          
          // Add a slight delay before retrying to ensure DB operations complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try one more time with a fresh state
          try {
            return await GroupScoreService.createOrUpdateGroupScore(score);
          } catch (retryError) {
            console.error('Error after retry:', retryError);
            throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.');
          }
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
