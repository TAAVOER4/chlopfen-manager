
import { BaseSupabaseService } from '../BaseSupabaseService';

/**
 * Gets the tournament IDs assigned to a specific user
 */
export async function getUserTournaments(userId: string): Promise<number[]> {
  try {
    const supabase = BaseSupabaseService.getClient();
    
    const { data, error } = await supabase
      .from('user_tournaments')
      .select('tournament_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting user tournaments:', error);
      return [];
    }
    
    return data ? data.map(t => t.tournament_id) : [];
  } catch (error) {
    console.error('Error getting user tournaments:', error);
    return [];
  }
}

/**
 * Updates tournament assignments for a user
 */
export async function updateUserTournaments(userId: string, tournamentIds: number[]): Promise<void> {
  try {
    const supabase = BaseSupabaseService.getClient();
    
    // Delete existing assignments first
    const { error: deleteError } = await supabase
      .from('user_tournaments')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting tournament assignments:', deleteError);
      return;
    }
    
    // Only add new assignments if there are any
    if (tournamentIds.length > 0) {
      const tournamentEntries = tournamentIds.map(tournamentId => ({
        user_id: userId,
        tournament_id: tournamentId
      }));
      
      const { error: insertError } = await supabase
        .from('user_tournaments')
        .insert(tournamentEntries);
      
      if (insertError) {
        console.error('Error adding tournament assignments:', insertError);
      }
    }
  } catch (error) {
    console.error('Error updating user tournaments:', error);
  }
}
