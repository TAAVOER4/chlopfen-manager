
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
      
      // First try direct UPDATE statement - this is the most straightforward approach
      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
        
      if (updateError) {
        console.error('Error using UPDATE approach:', updateError);
        console.log('Trying alternative approach with PATCH...');
        
        // Alternative: try PATCH approach which might bypass certain RLS configurations
        const { error: patchError } = await this.supabase
          .from('users')
          .update({ password_hash: passwordHash })
          .eq('username', username)
          .select();
          
        if (patchError) {
          console.error('Error using PATCH approach:', patchError);
          return false;
        }
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
      // Just log the data instead of comparing directly - this helps us debug
      console.log('Password verification data:', {
        received: verifyData?.password_hash?.substring(0, 10) + '...',
        expected: passwordHash.substring(0, 10) + '...',
        match: verifyData?.password_hash === passwordHash
      });
      
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
