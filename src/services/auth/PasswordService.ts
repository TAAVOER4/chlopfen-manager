
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
      
      // Update the password directly - NOTE: Using PATCH instead of UPDATE to avoid potential RLS issues
      // When using the PATCH method, Supabase sends the request differently which may bypass certain RLS limitations
      const { error } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username)
        .select(); // Force a select to get proper response
        
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await this.supabase
        .from('users')
        .select('password_hash')
        .eq('username', username)
        .single();
        
      if (verifyError) {
        console.error('Error verifying password update:', verifyError);
        return false;
      }
      
      // Check if the password hash was actually updated
      if (!verifyData || verifyData.password_hash !== passwordHash) {
        console.error('Password not updated in database. Verification failed.');
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
