
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { UserMapper } from './UserMapper';

export class UserQueryService extends BaseSupabaseService {
  /**
   * Fetches all users from the database
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from Supabase');
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*') as any;
        
      if (error) {
        console.error('Error loading users:', error);
        throw error;
      }
      
      if (!users || users.length === 0) {
        console.log('No users found in database');
        return [];
      }
      
      console.log(`Found ${users.length} users in database`);
      
      // Convert Supabase data to our User model format
      return users.map(UserMapper.toUserModel);
    } catch (error) {
      console.error('Error while fetching users:', error);
      throw error;
    }
  }
}
