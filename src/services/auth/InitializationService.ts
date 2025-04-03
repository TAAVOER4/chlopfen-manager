
import { BaseSupabaseService } from '../BaseSupabaseService';
import { UserRole } from '@/types';
import { DEFAULT_PASSWORD_HASH } from '@/utils/authUtils';

export class InitializationService extends BaseSupabaseService {
  /**
   * Initialize default users if none exist
   */
  static async initializeUsers(): Promise<void> {
    try {
      console.log('Checking for existing users...');
      
      // Check if the 'users' table exists
      const { error: tableCheckError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1) as any;
        
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.error('Users table does not exist, creating table...');
        return;
      }

      // Check if users already exist
      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1) as any;
        
      if (error) {
        console.error('Error checking existing users:', error);
        return;
      }
      
      // If no users exist, add default users
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No users found, adding default users...');
        
        // Use the default password hash from authUtils
        const defaultPasswordHash = DEFAULT_PASSWORD_HASH; // Hash for "password"
        console.log('Using default password hash:', defaultPasswordHash);
        
        const defaultUsers = [
          {
            name: 'Administrator',
            username: 'admin',
            role: 'admin' as UserRole,
            password_hash: defaultPasswordHash,
            individual_criterion: null,
            group_criterion: null
          },
          {
            name: 'Erwin Vogel',
            username: 'erwin.vogel@hotmail.com',
            role: 'admin' as UserRole,
            password_hash: defaultPasswordHash,
            individual_criterion: null,
            group_criterion: null
          }
        ];
        
        try {
          const { error: insertError } = await this.supabase
            .from('users')
            .insert(defaultUsers) as any;
            
          if (insertError) {
            console.error('Error adding default users:', insertError);
          } else {
            console.log('Default users added successfully.');
          }
        } catch (insertError) {
          console.error('Error adding default users:', insertError);
        }
      } else {
        console.log('Users already exist, skipping initialization.');
      }
    } catch (error) {
      console.error('Error in initializeUsers:', error);
    }
  }
}
