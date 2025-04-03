
import { BaseSupabaseService } from '../BaseSupabaseService';
import { hashPassword } from '@/utils/authUtils';

export class PasswordService extends BaseSupabaseService {
  /**
   * Update a user's password
   */
  static async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    try {
      console.log('Starting password update for user:', username);
      
      // Hash the password
      const passwordHash = hashPassword(newPassword);
      
      console.log('Updating password for user:', username);
      
      // First, check if the user exists
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
        
      if (userError || !userData) {
        console.error('User not found:', userError || 'No user data returned');
        return false;
      }
      
      console.log('User found, updating password hash');
      
      // Perform the update with the direct statement
      const { error } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
        
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      console.log('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      return false;
    }
  }
}
