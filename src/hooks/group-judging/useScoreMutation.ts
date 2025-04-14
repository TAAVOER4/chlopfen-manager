
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
      
      // Always refetch first
      await refetchScores();
      
      try {
        // Set a longer timeout for the operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), 15000)
        );
        
        // The actual score submission operation
        const submissionPromise = GroupScoreService.createOrUpdateGroupScore(score);
        
        // Race the operation against a timeout
        const result = await Promise.race([submissionPromise, timeoutPromise]);
        return result;
      } catch (error) {
        console.error('Error in score mutation:', error);
        
        // Handle constraint errors with retries
        if (error instanceof Error && 
            (error.message.includes('unique constraint') || 
             error.message.includes('bereits eine Bewertung') ||
             error.message.includes('duplicate key'))) {
          console.log('Handling constraint error in mutation');
          
          // Force another refetch
          await refetchScores();
          
          // Longer delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            // Try direct update approach
            return await GroupScoreService.createOrUpdateGroupScore(score, true);
          } catch (retryError) {
            console.error('Error after retry:', retryError);
            throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.');
          }
        }
        
        // If it's a timeout, provide a specific message
        if (error instanceof Error && error.message === 'Operation timed out') {
          throw new Error('Die Operation hat zu lange gedauert. Bitte versuchen Sie es erneut.');
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
