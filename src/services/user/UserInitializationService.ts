
import { BaseSupabaseService } from '../BaseSupabaseService';
import { UserRole } from '@/types';
import { hashPassword } from '@/utils/authUtils';

export class UserInitializationService extends BaseSupabaseService {
  static async initializeDefaultAdmin(): Promise<void> {
    try {
      // Check if any users exist
      const { data: existingUsers, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (checkError) {
        console.error('Error checking for users:', checkError);
        return;
      }
      
      // Only create default admin if no users exist
      if (!existingUsers || existingUsers.length === 0) {
        const defaultAdmin = {
          name: 'Administrator',
          username: 'admin',
          password_hash: hashPassword('admin'),
          role: 'admin' as UserRole,
          individual_criterion: null,
          group_criterion: null
        };
        
        const { error } = await this.supabase
          .from('users')
          .insert([defaultAdmin]);
          
        if (error) {
          console.error('Error creating default admin:', error);
          return;
        }
        
        console.log('Default admin user created successfully');
      } else {
        console.log('Users already exist, skipping admin initialization');
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
}
