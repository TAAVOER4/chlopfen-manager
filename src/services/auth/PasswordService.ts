
import { BaseSupabaseService } from '../BaseSupabaseService';
import { hashPassword } from '@/utils/authUtils';

export class PasswordService extends BaseSupabaseService {
  /**
   * Update a user's password
   */
  static async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    try {
      console.log('Starting password update for user:', username);
      
      // Hash the new password
      const passwordHash = hashPassword(newPassword);
      console.log('Password hash generated successfully');
      
      // Update the password directly
      const { error, count } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
        
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      if (count === 0) {
        console.warn('No rows updated. User might not exist:', username);
        return false;
      }
      
      console.log('Password updated successfully for user:', username);
      return true;
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      return false;
    }
  }
}
