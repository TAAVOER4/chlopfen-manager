
import { UserService } from './UserService';
import { AuthService } from './AuthService';
import { TournamentService } from './TournamentService';

// Export a combined service for backward compatibility
export class SupabaseService {
  // User operations
  static getAllUsers = UserService.getAllUsers;
  static createUser = UserService.createUser;
  static updateUser = UserService.updateUser;
  static deleteUser = UserService.deleteUser;
  static changePassword = UserService.changePassword;
  
  // Auth operations
  static authenticateUser = AuthService.authenticateUser;
  static initializeUsers = AuthService.initializeUsers;
  
  // Tournament operations
  static getAllTournaments = TournamentService.getAllTournaments;
  static getActiveTournament = TournamentService.getActiveTournament;
  static getTournamentById = TournamentService.getTournamentById;
  static createTournament = TournamentService.createTournament;
  static updateTournament = TournamentService.updateTournament;
  static setActiveTournament = TournamentService.setActiveTournament;
  static deleteTournament = TournamentService.deleteTournament;
  static getTournamentsByYear = TournamentService.getTournamentsByYear;
  static assignUserToTournament = TournamentService.assignUserToTournament;
  static removeUserFromTournament = TournamentService.removeUserFromTournament;
  static getUserTournaments = TournamentService.getUserTournaments;

  // Access to base supabase client (for direct queries)
  static supabase = UserService.supabase;
}
