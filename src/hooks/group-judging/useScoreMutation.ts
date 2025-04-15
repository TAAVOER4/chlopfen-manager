
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

  // Save score mutation
  const saveScoreMutation = useMutation({
    mutationFn: async (score: Omit<GroupScore, 'id'>) => {
      if (!currentUser?.id) {
        throw new Error('Benutzer nicht angemeldet oder Benutzer-ID fehlt');
      }

      // Make sure we have the user ID available for debugging
      const userId = String(currentUser.id);
      console.log(`Starting score save for user ${userId}, group ${score.groupId}`);

      // First, directly archive existing scores
      console.log(`Archiving existing scores for group ${score.groupId}`);
      
      try {
        // Direct SQL update approach - simplest and most reliable
        const { error } = await supabase.rpc('execute_sql', { 
          sql_command: `
            UPDATE public.group_scores 
            SET record_type = 'H', 
                modified_at = NOW(), 
                modified_by = '${userId}'
            WHERE group_id = ${score.groupId} 
            AND tournament_id = ${score.tournamentId}
            AND record_type = 'C'
          `
        });
        
        if (error) {
          console.error('Error archiving scores:', error);
        } else {
          console.log('Successfully archived existing scores');
        }
      } catch (archiveError) {
        console.error('Exception during archive operation:', archiveError);
      }
      
      // Short delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create the new score
      console.log('Creating new score record');
      const scoreWithUser = {
        ...score,
        judgeId: userId
      };
      
      // Create a new score
      return await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: userId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_by: userId,
          modified_at: new Date().toISOString()
        }])
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          
          console.log('Successfully created new score:', data);
          
          return {
            id: data.id,
            groupId: data.group_id,
            judgeId: userId,
            whipStrikes: data.whip_strikes,
            rhythm: data.rhythm,
            tempo: data.tempo,
            time: data.time,
            tournamentId: data.tournament_id
          };
        });
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
