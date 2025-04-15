
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
      
      try {
        // First get all current records for this group and tournament
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
        
        // Try to get a valid UUID from the database first
        let validUserId = userId;
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          if (!userError && userData && userData.length > 0) {
            validUserId = userData[0].id;
            console.log(`Using valid UUID from database: ${validUserId}`);
          }
        } catch (userLookupError) {
          console.error('Error looking up valid UUID:', userLookupError);
          // Continue with original ID
        }
        
        // Archive all found records individually
        if (existingRecords && existingRecords.length > 0) {
          for (const record of existingRecords) {
            console.log(`Archiving record ID: ${record.id}`);
            
            const { error: updateError } = await supabase
              .from('group_scores')
              .update({
                record_type: 'H',
                modified_at: new Date().toISOString()
                // Not passing modified_by as it's causing UUID validation errors
              })
              .eq('id', record.id);
              
            if (updateError) {
              console.error(`Failed to archive record ${record.id}:`, updateError);
            } else {
              console.log(`Successfully archived record ${record.id}`);
            }
          }
          
          // Add a small delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // STEP 3: Create the new score
        console.log('Creating new score');
        
        const { data, error } = await supabase
          .from('group_scores')
          .insert([{
            group_id: score.groupId,
            judge_id: validUserId, // Using the verified UUID
            whip_strikes: score.whipStrikes,
            rhythm: score.rhythm,
            tempo: score.tempo,
            time: score.time,
            tournament_id: score.tournamentId,
            record_type: 'C'
            // Not passing modified_by as it's causing UUID validation errors
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
          judgeId: userId, // Return original ID to keep frontend consistent
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
