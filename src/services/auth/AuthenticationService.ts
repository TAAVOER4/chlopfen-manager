
import { User } from '@/types';
import { BaseSupabaseService } from '../BaseSupabaseService';
import { PasswordService } from './PasswordService';
import { hashPassword } from '@/utils/authUtils';

// Import from a different file to avoid circular dependency
import { AuthUserData } from './types/AuthTypes';
import { mapDatabaseUserToUser } from './UserMapper';

type DatabaseUser = {
  id: string;
  name: string;
  username: string;
  role: string;
  password_hash: string;
  individual_criterion: string | null;
  group_criterion: string | null;
}

export class AuthenticationService extends BaseSupabaseService {
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      // Step 1: Get the user by username
      const { data: users, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (userError || !users) {
        console.error('Error finding user:', userError?.message || 'User not found');
        return null;
      }

      const dbUser = users as DatabaseUser;

      // Step 2: Verify the password
      const passwordValid = await this.verifyPassword(password, dbUser.password_hash);
      
      if (!passwordValid) {
        console.log('Password invalid for user:', username);
        return null;
      }

      // Step 3: Return the user if password is valid
      return mapDatabaseUserToUser(dbUser as AuthUserData);
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Helper method for password verification
  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await import('@/utils/authUtils').then(({ verifyPassword }) => {
      return verifyPassword(password, hash);
    });
  }

  static async initializeUsers(): Promise<void> {
    console.log('Initializing users...');
    try {
      // Check if admin user exists
      const { data: existingUsers, error: userCheckError } = await this.supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .maybeSingle();

      if (userCheckError) {
        console.error('Error checking for admin user:', userCheckError);
        return;
      }

      // If admin exists, do nothing
      if (existingUsers) {
        console.log('Admin user already exists, skipping initialization');
        return;
      }

      // Create default admin user if none exists
      const defaultAdmin = {
        username: 'admin',
        name: 'Administrator',
        password_hash: await import('@/utils/authUtils').then(({hashPassword}) => hashPassword('admin')),
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
      };

      const { error: createError } = await this.supabase
        .from('users')
        .insert([defaultAdmin]);

      if (createError) {
        console.error('Error creating default admin:', createError);
        return;
      }

      console.log('Default admin user created successfully');
    } catch (error) {
      console.error('Error initializing users:', error);
    }
  }
  
  // Helper method for password hash generation - needed in LoginForm
  static generatePasswordHash(password: string): string {
    return hashPassword(password);
  }
}
