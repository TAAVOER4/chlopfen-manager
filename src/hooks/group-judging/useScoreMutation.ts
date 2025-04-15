
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { archiveGroupScores } from '@/lib/supabase';

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
      console.log(`Starting score save for user ${userId}, group ${score.groupId}, tournament ${score.tournamentId}`);
      
      try {
        // First, archive all existing records for this group and tournament
        console.log('Archiving existing records...');
        
        const archiveSuccess = await archiveGroupScores(
          score.groupId, 
          score.tournamentId,
          userId // Pass the userId for modified_by
        );
        
        if (!archiveSuccess) {
          console.error('Failed to archive existing records, but will continue with creating the new record');
        } else {
          console.log('Successfully archived existing records');
        }
        
        // Add a small delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create the new score with record_type 'C'
        console.log('Creating new score');
        
        const { data, error } = await supabase
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
            modified_at: new Date().toISOString(),
            modified_by: userId
          }])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating new score:', error);
          throw error;
        }
        
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
      } catch (error) {
        console.error('Error during score saving process:', error);
        throw error;
      }
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
