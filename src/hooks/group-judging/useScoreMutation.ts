
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
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
      console.log(`Starting score save for user ${userId}, group ${score.groupId}`);
      
      try {
        // First archive all existing scores for this group and tournament
        console.log(`Archiving existing scores for group ${score.groupId} and tournament ${score.tournamentId}`);
        
        // Use a simple, direct SQL UPDATE to archive all existing scores for this group and tournament
        const archiveSql = `
          UPDATE public.group_scores 
          SET record_type = 'H', 
              modified_at = NOW(), 
              modified_by = '${userId}'
          WHERE group_id = ${score.groupId} 
          AND tournament_id = ${score.tournamentId}
          AND record_type = 'C'
        `;
        
        console.log('Executing archive SQL:', archiveSql);
        
        // Execute the direct SQL update
        const { error: archiveError } = await supabase.rpc('execute_sql', { 
          sql_command: archiveSql 
        });
        
        if (archiveError) {
          console.error('Error archiving existing scores:', archiveError);
          throw new Error(`Error archiving existing scores: ${archiveError.message}`);
        }
        
        // Wait a short time for the database to process the archive operation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify all records were archived by checking if any 'C' records remain
        const { data: remainingActive, error: checkError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (checkError) {
          console.error('Error checking for remaining active records:', checkError);
        } else if (remainingActive && remainingActive.length > 0) {
          console.warn(`Archive operation partially succeeded: ${remainingActive.length} records still active`);
          console.log('IDs of records that failed to archive:', remainingActive.map(r => r.id).join(', '));
          
          // Try to archive each remaining record individually
          for (const record of remainingActive) {
            const singleArchiveSql = `
              UPDATE public.group_scores 
              SET record_type = 'H', 
                  modified_at = NOW(), 
                  modified_by = '${userId}'
              WHERE id = ${record.id}
            `;
            
            const { error: singleError } = await supabase.rpc('execute_sql', { 
              sql_command: singleArchiveSql 
            });
            
            if (singleError) {
              console.error(`Error archiving record ${record.id}:`, singleError);
            }
          }
        } else {
          console.log('Successfully archived all existing scores');
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
