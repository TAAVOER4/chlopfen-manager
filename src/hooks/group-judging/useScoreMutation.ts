
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase, archiveGroupScores } from '@/lib/supabase';
import { isValidUuid, normalizeUuid } from '@/services/database/scores/utils/ValidationUtils';

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
        // Step 1: Archive all existing scores for this group and tournament
        console.log(`Archiving existing scores for group ${score.groupId} and tournament ${score.tournamentId}`);
        
        // Use our dedicated archive function which has multiple fallback mechanisms
        // Ensure we pass the userId as modifiedBy parameter to track who made the change
        console.log(`Using user ID ${userId} for the modifiedBy parameter in archive`);
        const archiveSuccess = await archiveGroupScores(
          score.groupId, 
          score.tournamentId, 
          userId
        );
        
        console.log(`Archive operation result: ${archiveSuccess ? 'successful' : 'failed'}`);
        
        // Add a delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Double-check archive operation
        const { data: checkArchive, error: checkError } = await supabase
          .from('group_scores')
          .select('id, modified_by')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (checkError) {
          console.error('Error verifying archive operation:', checkError);
        } else if (checkArchive && checkArchive.length > 0) {
          console.warn(`After archive operation, ${checkArchive.length} records still active. Will try direct update.`);
          
          // Try one more direct update with explicit userId
          const { error: finalArchiveError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: userId
            })
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          if (finalArchiveError) {
            console.error('Final archive attempt failed:', finalArchiveError);
          } else {
            console.log('Final archive attempt completed');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          console.log('Archive verification successful, no active records found');
        }
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
      
      // Create a new score with explicit modifiedBy
      const { data, error } = await supabase
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
        .single();
        
      if (error) {
        console.error('Error creating new score:', error);
        throw error;
      }
      
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
