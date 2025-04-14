
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { getUserTournaments } from './UserTournamentService';
import { mapDatabaseUserToAppUser } from './UserMapper';

export class UserQueryService extends BaseSupabaseService {
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from Supabase');
      
      // Fetch all users
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*');
        
      if (error) {
        console.error('Error loading users:', error);
        return [];
      }
      
      if (!users || users.length === 0) {
        console.log('No users found in database');
        return [];
      }
      
      // For each user, get their assigned tournaments
      const usersWithTournaments = await Promise.all(users.map(async (user) => {
        // Get tournament IDs for this user
        const tournamentIds = await getUserTournaments(user.id);
          
        // Map database user to app user
        const appUser = mapDatabaseUserToAppUser(user);
        appUser.tournamentIds = tournamentIds;
        
        return appUser;
      }));
      
      console.log('Found', users.length, 'users in database');
      
      return usersWithTournaments;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }
}
