
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, Tournament } from '@/types';
import { AuthService } from './AuthService';
import { TournamentService } from './TournamentService';
import { UserService } from './user/UserService';
import { UserInitializationService } from './user/UserInitializationService';

export class SupabaseService extends BaseSupabaseService {
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database...');
      await this.initializeUsers();
      console.log('Database initialization complete');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Users
  static async initializeUsers(): Promise<void> {
    try {
      await AuthService.initializeUsers();
    } catch (error) {
      console.error('Error initializing users:', error);
    }
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    return AuthService.authenticateUser(username, password);
  }

  static async getAllUsers(): Promise<User[]> {
    return UserService.getAllUsers();
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    return UserService.createUser(user);
  }

  static async updateUser(user: User): Promise<User> {
    return UserService.updateUser(user);
  }

  static async deleteUser(username: string): Promise<void> {
    return UserService.deleteUser(username);
  }

  static async changePassword(username: string, newPassword: string): Promise<boolean> {
    return UserService.changePassword(username, newPassword);
  }

  // Tournaments
  static async getAllTournaments(): Promise<Tournament[]> {
    return TournamentService.getAllTournaments();
  }

  static async createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
    return TournamentService.createTournament(tournament);
  }

  static async updateTournament(tournament: Tournament): Promise<Tournament> {
    return TournamentService.updateTournament(tournament);
  }

  static async deleteTournament(id: number): Promise<void> {
    return TournamentService.deleteTournament(id);
  }

  static async setActiveTournament(tournamentId: number): Promise<void> {
    return TournamentService.setActiveTournament(tournamentId);
  }
}
