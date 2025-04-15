
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';

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

  // Direct database operation to archive scores
  const forceDirectArchiveOperation = async (groupId: number, tournamentId: number) => {
    if (!currentUser?.id) return false;
    
    console.log(`Performing direct archive operation for group ${groupId}, tournament ${tournamentId}`);
    
    try {
      // Use a direct SQL update to ensure all scores are archived
      const { error } = await supabase
        .from('group_scores')
        .update({ 
          record_type: 'H',
          modified_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
      
      if (error) {
        console.error('Error during direct archive operation:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception during direct archive operation:', error);
      return false;
    }
  };

  // Save score mutation
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }

      const scoreWithUser = {
        ...score,
        judgeId: String(currentUser.id)
      };

      console.log('Starting score save process...');
      
      // First perform direct database archive operation
      const archiveSuccess = await forceDirectArchiveOperation(score.groupId, score.tournamentId);
      console.log(`Direct archive operation result: ${archiveSuccess ? 'success' : 'failed'}`);
      
      // Short delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Then create the new score
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
