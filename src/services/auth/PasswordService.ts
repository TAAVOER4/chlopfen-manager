
import { BaseSupabaseService } from '../BaseSupabaseService';
import { hashPassword } from '@/utils/authUtils';

export class PasswordService extends BaseSupabaseService {
  /**
   * Update a user's password
   */
  static async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    try {
      // Hash the new password
      const passwordHash = hashPassword(newPassword);
      
      // Find the user
      const { data: users, error: findError } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1) as any;
      
      if (findError || !users || users.length === 0) {
        console.error('User not found for password update:', username);
        return false;
      }
      
      // Update the password
      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username) as any;
        
      if (updateError) {
        console.error('Error updating password:', updateError);
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
