
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
      const archiveSuccess = await archiveGroupScores(score.groupId, score.tournamentId);
      
      if (!archiveSuccess) {
        console.warn('Could not archive scores using function, trying direct update');
        
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
      
      // Then create the new score - pass true to force archiving again as a safety measure
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
