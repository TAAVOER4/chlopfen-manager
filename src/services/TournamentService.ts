
import { BaseSupabaseService } from './BaseSupabaseService';
import { Tournament } from '@/types';

export class TournamentService extends BaseSupabaseService {
  // Get all tournaments
  static async getAllTournaments(): Promise<Tournament[]> {
    const { data: tournaments, error } = await this.supabase
      .from('tournaments')
      .select('*');
      
    if (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
    
    return (tournaments || []).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      date: tournament.date,
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.is_active
    }));
  }

  // Get active tournament
  static async getActiveTournament(): Promise<Tournament | null> {
    // First check session storage
    const storedTournamentId = sessionStorage.getItem('activeTournamentId');
    if (storedTournamentId) {
      const { data: tournamentFromStorage, error } = await this.supabase
        .from('tournaments')
        .select('*')
        .eq('id', storedTournamentId)
        .single();
        
      if (!error && tournamentFromStorage) {
        return {
          id: tournamentFromStorage.id,
          name: tournamentFromStorage.name,
          date: tournamentFromStorage.date,
          location: tournamentFromStorage.location,
          year: tournamentFromStorage.year,
          isActive: tournamentFromStorage.is_active
        };
      }
    }
    
    // Fall back to the tournament marked as active in the database
    const { data: activeTournament, error } = await this.supabase
      .from('tournaments')
      .select('*')
      .eq('is_active', true)
      .single();
      
    if (error || !activeTournament) {
      console.error('Error fetching active tournament:', error);
      return null;
    }
    
    return {
      id: activeTournament.id,
      name: activeTournament.name,
      date: activeTournament.date,
      location: activeTournament.location,
      year: activeTournament.year,
      isActive: activeTournament.is_active
    };
  }

  // Get tournament by ID
  static async getTournamentById(id: number): Promise<Tournament | null> {
    const { data: tournament, error } = await this.supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !tournament) {
      console.error('Error fetching tournament by ID:', error);
      return null;
    }
    
    return {
      id: tournament.id,
      name: tournament.name,
      date: tournament.date,
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.is_active
    };
  }

  // Create tournament
  static async createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
    const { data, error } = await this.supabase
      .from('tournaments')
      .insert([{
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        year: tournament.year,
        is_active: tournament.isActive
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned after tournament creation');
    }
    
    return {
      id: data.id,
      name: data.name,
      date: data.date,
      location: data.location,
      year: data.year,
      isActive: data.is_active
    };
  }

  // Update tournament
  static async updateTournament(tournament: Tournament): Promise<Tournament> {
    const { data, error } = await this.supabase
      .from('tournaments')
      .update({
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        year: tournament.year,
        is_active: tournament.isActive
      })
      .eq('id', tournament.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned after tournament update');
    }
    
    return {
      id: data.id,
      name: data.name,
      date: data.date,
      location: data.location,
      year: data.year,
      isActive: data.is_active
    };
  }

  // Set active tournament
  static async setActiveTournament(tournamentId: number): Promise<void> {
    // First, set all tournaments as inactive
    const { error: updateError } = await this.supabase
      .from('tournaments')
      .update({ is_active: false })
      .not('id', 'eq', tournamentId);
      
    if (updateError) {
      console.error('Error deactivating tournaments:', updateError);
      throw updateError;
    }
    
    // Then set the specific tournament as active
    const { error } = await this.supabase
      .from('tournaments')
      .update({ is_active: true })
      .eq('id', tournamentId);
      
    if (error) {
      console.error('Error activating tournament:', error);
      throw error;
    }
    
    // Save to session storage as well
    sessionStorage.setItem('activeTournamentId', tournamentId.toString());
  }

  // Delete tournament
  static async deleteTournament(tournamentId: number): Promise<void> {
    const { error } = await this.supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);
      
    if (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }

  // Get tournaments by year
  static async getTournamentsByYear(year: number): Promise<Tournament[]> {
    const { data: tournaments, error } = await this.supabase
      .from('tournaments')
      .select('*')
      .eq('year', year);
      
    if (error) {
      console.error('Error fetching tournaments by year:', error);
      throw error;
    }
    
    return (tournaments || []).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      date: tournament.date,
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.is_active
    }));
  }

  // Assign user to tournament
  static async assignUserToTournament(userId: string, tournamentId: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_tournaments')
      .insert([{
        user_id: userId,
        tournament_id: tournamentId
      }]);
      
    if (error) {
      console.error('Error assigning user to tournament:', error);
      throw error;
    }
  }

  // Remove user from tournament
  static async removeUserFromTournament(userId: string, tournamentId: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_tournaments')
      .delete()
      .eq('user_id', userId)
      .eq('tournament_id', tournamentId);
      
    if (error) {
      console.error('Error removing user from tournament:', error);
      throw error;
    }
  }

  // Get tournaments for a user
  static async getUserTournaments(userId: string): Promise<Tournament[]> {
    const { data: userTournamentLinks, error } = await this.supabase
      .from('user_tournaments')
      .select('tournament_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user tournament links:', error);
      throw error;
    }
    
    if (!userTournamentLinks || userTournamentLinks.length === 0) {
      return [];
    }
    
    const tournamentIds = userTournamentLinks.map(link => link.tournament_id);
    
    const { data: tournaments, error: tournamentError } = await this.supabase
      .from('tournaments')
      .select('*')
      .in('id', tournamentIds);
      
    if (tournamentError) {
      console.error('Error fetching user tournaments:', tournamentError);
      throw tournamentError;
    }
    
    return (tournaments || []).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      date: tournament.date,
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.is_active
    }));
  }
}
