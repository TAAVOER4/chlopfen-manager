
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

  // Mutation for saving scores with improved handling
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to database:', score);
      
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }
      
      // Ensure judgeId is set to the current user's ID
      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };
      
      try {
        // Add a slight delay to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Attempt to create or update the score
        return await GroupScoreService.createOrUpdateGroupScore(scoreWithUser);
      } catch (error) {
        console.error('Error in score mutation:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('unique constraint') || 
              error.message.includes('duplicate key')) {
            
            // Add a longer delay before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Force a clean slate by refetching scores
            await refetchScores();
            
            // Try one more time with force flag
            return await GroupScoreService.createOrUpdateGroupScore(scoreWithUser, true);
          }
          
          throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.');
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Score saved successfully');
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
