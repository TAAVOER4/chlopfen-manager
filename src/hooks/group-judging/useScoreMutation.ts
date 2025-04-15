
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { archiveGroupScores, supabase } from '@/lib/supabase';

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
      
      // First, archive all existing scores for this group and tournament
      // Pass the current user ID to be used for modified_by
      const archiveSuccess = await archiveGroupScores(
        score.groupId, 
        score.tournamentId,
        String(currentUser.id)
      );
      
      if (!archiveSuccess) {
        console.warn('Could not archive scores using archiveGroupScores, trying direct update');
        
        // Try a direct update as fallback
        const { error: updateError } = await supabase
          .from('group_scores')
          .update({ 
            record_type: 'H',
            modified_at: new Date().toISOString(),
            modified_by: String(currentUser.id)
          })
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (updateError) {
          console.error('Error updating existing scores:', updateError);
          throw new Error('Fehler beim Archivieren der bestehenden Bewertungen');
        }
      }
      
      // Add delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify that records were actually archived
      const { data: activeRecords, error: checkError } = await supabase
        .from('group_scores')
        .select('id')
        .eq('group_id', score.groupId)
        .eq('tournament_id', score.tournamentId)
        .eq('record_type', 'C');
        
      if (checkError) {
        console.error('Error checking archived records:', checkError);
      } else if (activeRecords && activeRecords.length > 0) {
        console.warn(`Archive verification failed: ${activeRecords.length} records still active`);
        
        // One last attempt to archive using direct SQL - this should be reliable
        const sqlCommand = `
          UPDATE public.group_scores 
          SET record_type = 'H', 
              modified_at = NOW(),
              modified_by = '${String(currentUser.id)}'
          WHERE group_id = ${score.groupId} 
          AND tournament_id = ${score.tournamentId}
          AND record_type = 'C'
        `;
        
        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', { 
          sql_command: sqlCommand 
        });
        
        if (sqlError) {
          console.error('Final archive attempt failed:', sqlError);
        } else {
          console.log('Final archive attempt completed');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Then create the new score with an explicit modified_by value
      const newScore = {
        ...scoreWithUser,
        modified_by: String(currentUser.id)
      };
      
      return await GroupScoreService.createGroupScore(newScore, true);
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
