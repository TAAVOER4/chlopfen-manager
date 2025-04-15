
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

  // Direct database operation to archive scores - now using a more direct approach
  const forceDirectArchiveOperation = async (groupId: number, tournamentId: number) => {
    if (!currentUser?.id) return false;
    
    console.log(`Performing DIRECT SQL archive operation for group ${groupId}, tournament ${tournamentId}`);
    
    try {
      // First try to execute raw SQL update directly to ensure more control
      // This bypasses the ORM layer entirely to ensure the operation happens
      const { error: rawError } = await supabase.rpc('execute_sql', {
        sql_command: `UPDATE public.group_scores 
                    SET record_type = 'H', 
                        modified_at = NOW() 
                    WHERE group_id = ${groupId} 
                    AND tournament_id = ${tournamentId}
                    AND record_type = 'C'`
      });
      
      if (rawError) {
        console.error('Error during raw SQL archive operation:', rawError);
        
        // Fallback to standard UPDATE if RPC fails
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
          console.error('Error during fallback archive operation:', error);
          return false;
        }
      }
      
      // Verify the operation worked by checking if any records are still active
      const { data: stillActive, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
      
      if (checkError) {
        console.error('Error checking archive results:', checkError);
        return false;
      }
      
      if (stillActive && stillActive.length > 0) {
        console.warn(`${stillActive.length} records still active after archive operation`);
        return false;
      }
      
      console.log('Archive operation successful, all records archived');
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
      
      // First perform direct database archive operation and wait for it to complete
      const archiveSuccess = await forceDirectArchiveOperation(score.groupId, score.tournamentId);
      console.log(`Direct archive operation result: ${archiveSuccess ? 'success' : 'failed'}`);
      
      // Add delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then create the new score - using the createGroupScore method with explicit archive setting
      return await GroupScoreService.createGroupScore(scoreWithUser, true);
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
