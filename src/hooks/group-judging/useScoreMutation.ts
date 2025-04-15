
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

      // Make sure we have the user ID available for debugging
      const userId = String(currentUser.id);
      console.log(`🔍 SAVE SCORE - Starting save process for user ${userId}`);
      console.log('Score data to save:', score);

      const scoreWithUser = {
        ...score,
        judgeId: userId
      };
      
      // Step 1: Archive all existing scores for this group and tournament
      console.log(`🔍 SAVE SCORE - Step 1: Archiving existing scores for group ${score.groupId}, tournament ${score.tournamentId}`);
      
      // Call archiveGroupScores with the current user ID for modified_by
      const archiveSuccess = await archiveGroupScores(
        score.groupId, 
        score.tournamentId,
        userId // Explicitly pass user ID for modified_by
      );
      
      if (!archiveSuccess) {
        console.warn('⚠️ Could not archive scores using archiveGroupScores function');
        console.log('🔍 SAVE SCORE - Attempting additional direct record update as fallback');
        
        try {
          // Log the current state before update
          const { data: beforeUpdate } = await supabase
            .from('group_scores')
            .select('*')
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          console.log('Records before update:', beforeUpdate);
          
          // Try direct SQL command with explicit values
          const sqlCommand = `
            UPDATE public.group_scores 
            SET record_type = 'H', 
                modified_at = NOW(), 
                modified_by = '${userId}'
            WHERE group_id = ${score.groupId} 
            AND tournament_id = ${score.tournamentId}
            AND record_type = 'C'
          `;
          
          const { data: sqlResult, error: sqlError } = await supabase.rpc('execute_sql', { 
            sql_command: sqlCommand 
          });
          
          if (sqlError) {
            console.error('❌ Error with SQL command:', sqlError);
          } else {
            console.log('✅ SQL command executed:', sqlResult);
          }
          
          // Check the state after update
          const { data: afterUpdate } = await supabase
            .from('group_scores')
            .select('*')
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          console.log('Records after update:', afterUpdate);
        } catch (directError) {
          console.error('❌ Error in direct SQL update:', directError);
        }
      }
      
      // Add delay to ensure database consistency
      console.log('🔍 SAVE SCORE - Waiting for database consistency...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Create new score record
      console.log('🔍 SAVE SCORE - Step 2: Creating new score record');
      
      // Add explicit modified_by to ensure it's set
      const newScore = {
        ...scoreWithUser,
        modified_by: userId
      };
      
      console.log('Final score data being saved:', newScore);
      
      // Create the new score with forceArchive=true (belt and suspenders approach)
      return await GroupScoreService.createGroupScore(newScore, true);
    },
    onSuccess: (result) => {
      console.log('✅ Score saved successfully:', result);
      refetchScores();
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Bewertung wurde erfolgreich gespeichert.",
      });
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error);
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
