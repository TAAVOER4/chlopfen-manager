
import { BaseSupabaseService } from '../BaseSupabaseService';
import { hashPassword } from '@/utils/authUtils';

export class PasswordService extends BaseSupabaseService {
  /**
   * Update a user's password
   */
  static async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    try {
      console.log('Starting password update for user:', username);
      
      // Hash the new password at the service level, not during input
      const passwordHash = hashPassword(newPassword);
      console.log('Password hash generated successfully');
      
      // Log more details about the update operation
      console.log('Updating password for user with username:', username);
      
      // Update the password directly
      const { error, count, data } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
        
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      console.log('Password update response:', { error, count, data });
      
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
