
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
      console.log(`Starting score save for user ${userId}, group ${score.groupId}, tournament ${score.tournamentId}`);
      
      // ---------- SIMPLIFIED DIRECT APPROACH ----------
      console.log("Using simplified direct approach for archiving records");
      
      try {
        // STEP 1: First get all existing records for this group and tournament
        const { data: existingRecords, error: findError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (findError) {
          console.error('Error finding existing records:', findError);
          throw new Error(`Could not find existing records: ${findError.message}`);
        }
        
        console.log(`Found ${existingRecords?.length || 0} existing records to archive`);
        
        // STEP 2: Archive all found records individually
        if (existingRecords && existingRecords.length > 0) {
          for (const record of existingRecords) {
            console.log(`Direct update of record ID: ${record.id}`);
            
            const { error: updateError } = await supabase
              .from('group_scores')
              .update({
                record_type: 'H',
                modified_at: new Date().toISOString(),
                modified_by: userId
              })
              .eq('id', record.id);
              
            if (updateError) {
              console.error(`Failed to archive record ${record.id}:`, updateError);
            } else {
              console.log(`Successfully archived record ${record.id}`);
            }
            
            // Small delay between operations
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Add a small delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // STEP 3: Verify that all records were archived properly
        const { data: verifyRecords, error: verifyError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', score.groupId)
          .eq('tournament_id', score.tournamentId)
          .eq('record_type', 'C');
          
        if (verifyError) {
          console.error('Error verifying archive operation:', verifyError);
        } else if (verifyRecords && verifyRecords.length > 0) {
          console.warn(`After archiving, ${verifyRecords.length} records still active! Trying one final time...`);
          
          // STEP 4: One final attempt to archive all at once using UPDATE
          const { error: finalError } = await supabase
            .from('group_scores')
            .update({
              record_type: 'H',
              modified_at: new Date().toISOString(),
              modified_by: userId
            })
            .eq('group_id', score.groupId)
            .eq('tournament_id', score.tournamentId)
            .eq('record_type', 'C');
            
          if (finalError) {
            console.error('Final archive attempt failed:', finalError);
          } else {
            console.log('Final archive attempt completed successfully');
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } else {
          console.log('All records successfully archived ✅');
        }
      } catch (archiveError) {
        console.error('Error during archive operation:', archiveError);
        // Continue with creating new score even if archiving fails
      }
      
      // STEP 5: Create the new score
      console.log('Creating new score with user ID:', userId);
      
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
          modified_by: userId,
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
        judgeId: userId,
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
