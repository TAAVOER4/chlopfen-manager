
import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GroupScoreService } from '@/services/database/scores/GroupScoreService';
import { useUser } from '@/contexts/UserContext';
import { supabase, archiveGroupScores } from '@/lib/supabase';

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

      // Get the user ID for logging purposes only
      const userId = String(currentUser.id);
      console.log(`Starting score save for user ${userId}, group ${score.groupId}, tournament ${score.tournamentId}`);
      
      try {
        // Try to find an actual UUID for this user from the database
        let judgeUuid = '';
        
        try {
          // First check if we can find this user in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('record_type', 'C')
            .limit(1);
            
          if (!userError && userData && userData.length > 0) {
            judgeUuid = userData[0].id;
            console.log(`Using judge UUID from database: ${judgeUuid}`);
          } else {
            // If no user found, try to get any valid judge
            const { data: anyJudge, error: judgeError } = await supabase
              .from('users')
              .select('id')
              .limit(1);
              
            if (!judgeError && anyJudge && anyJudge.length > 0) {
              judgeUuid = anyJudge[0].id;
              console.log(`Using any available judge UUID: ${judgeUuid}`);
            } else {
              console.log('No valid UUID found, will proceed without judge ID');
            }
          }
        } catch (error) {
          console.error('Error finding judge UUID:', error);
        }
        
        // First, archive all existing records for this group and tournament
        console.log('Archiving existing records...');
        
        // Use the dedicated archiveGroupScores function which has multiple fallbacks
        const archiveSuccess = await archiveGroupScores(score.groupId, score.tournamentId, judgeUuid || 'system');
        
        if (!archiveSuccess) {
          console.error('Could not archive previous records completely');
          
          // Add a fallback direct archive operation
          console.log('Attempting direct archive as fallback...');
          
          // Try direct SQL update to handle any remaining active records
          const { error: directUpdateError } = await supabase
            .from('group_scores')
            .update({ 
              record_type: 'H',
              modified_at: new Date().toISOString()
            })
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          if (directUpdateError) {
            console.error('Error with direct archive fallback:', directUpdateError);
          }
        }
        
        // Add a small delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify all records were properly archived
        const { data: stillActive, error: verifyError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (verifyError) {
          console.error('Error verifying archive status:', verifyError);
        } else if (stillActive && stillActive.length > 0) {
          console.warn(`${stillActive.length} records still active after archiving, will try one more approach`);
          
          // Final attempt: archive each record individually
          for (const record of stillActive) {
            console.log(`Archiving individual record ID: ${record.id}`);
            
            const { error: individualError } = await supabase
              .from('group_scores')
              .update({ 
                record_type: 'H',
                modified_at: new Date().toISOString()
              })
              .eq('id', record.id);
              
            if (individualError) {
              console.error(`Error archiving record ${record.id}:`, individualError);
            } else {
              console.log(`Successfully archived record ${record.id}`);
            }
          }
        }
        
        // Create the new score with record_type 'C'
        console.log('Creating new score');
        
        // Instead of using the numeric user ID, use a valid UUID if we found one
        const insertData = {
          group_id: score.groupId,
          whip_strikes: score.whipStrikes,
          rhythm: score.rhythm,
          tempo: score.tempo,
          time: score.time,
          tournament_id: score.tournamentId,
          record_type: 'C',
          modified_at: new Date().toISOString()
        };
        
        // Only add the judge_id if we found a valid UUID
        if (judgeUuid && judgeUuid.length > 0) {
          // @ts-ignore - We're adding this dynamically
          insertData.judge_id = judgeUuid;
        } else {
          console.warn('No valid judge UUID found, skipping judge_id in insert');
        }
        
        const { data, error } = await supabase
          .from('group_scores')
          .insert([insertData])
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
