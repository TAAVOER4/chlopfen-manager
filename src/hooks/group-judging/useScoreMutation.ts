
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { isValidUuid, normalizeUuid } from '@/services/database/scores/utils/ValidationUtils';
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
      console.log(`Starting score save for user ${userId}, group ${score.groupId}`);
      
      try {
        // Use our dedicated function to archive all existing scores
        // This is more reliable than inline SQL
        console.log(`Using dedicated archive function for group ${score.groupId} and tournament ${score.tournamentId}`);
        
        const archiveSuccess = await archiveGroupScores(
          score.groupId, 
          score.tournamentId, 
          userId
        );
        
        console.log(`Archive operation result: ${archiveSuccess ? 'successful' : 'failed'}`);
        
        // Add a delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (archiveError) {
        console.error('Exception during archive operation:', archiveError);
        // Continue with creating a new score even if archiving fails
      }
      
      // Find or generate a valid UUID for the judge
      let judgeUuid = userId;
      
      // Check if the user ID might be a numeric ID that needs to be converted to UUID
      if (!isValidUuid(userId)) {
        console.log('User ID is not a valid UUID, attempting to look up UUID from users table');
        
        try {
          // Try to find a corresponding UUID in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('record_type', 'C')
            .limit(1);
            
          if (userError) {
            console.error('Error looking up user UUID:', userError);
          } else if (userData && userData.length > 0) {
            judgeUuid = userData[0].id;
            console.log(`Found valid UUID to use: ${judgeUuid}`);
          } else {
            console.warn('No valid user found, will attempt to continue with original ID');
          }
        } catch (lookupError) {
          console.error('Error during user UUID lookup:', lookupError);
        }
      }
      
      console.log(`Creating new score with judge UUID: ${judgeUuid}`);
      
      // Create a new score
      return await supabase
        .from('group_scores')
        .insert([{
          group_id: score.groupId,
          judge_id: judgeUuid,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_by: judgeUuid,
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
            judgeId: userId, // Return the original ID to the frontend
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
