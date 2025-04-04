
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { getUserTournaments } from './UserTournamentService';

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
          
        return {
          id: parseInt(user.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000, // Convert string ID to number
          name: user.name,
          username: user.username,
          role: user.role,
          passwordHash: user.password_hash,
          assignedCriteria: {
            individual: user.individual_criterion as any,
            group: user.group_criterion as any
          },
          tournamentIds
        };
      }));
      
      console.log('Found', users.length, 'users in database');
      
      return usersWithTournaments;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }
}
