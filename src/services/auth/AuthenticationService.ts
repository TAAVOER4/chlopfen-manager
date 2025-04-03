
import { User } from '@/types';
import { BaseSupabaseService } from '../BaseSupabaseService';
import { PasswordService } from './PasswordService';
import { UserMapper } from './UserMapper';

// Direct import to avoid circular dependency
import { AuthUser, DbUser } from './types/AuthTypes';

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

      const dbUser = users as DbUser;

      // Step 2: Verify the password
      const passwordValid = await PasswordService.verifyPassword(password, dbUser.password_hash);
      
      if (!passwordValid) {
        console.log('Password invalid for user:', username);
        return null;
      }

      // Step 3: Return the user if password is valid
      return UserMapper.mapDbUserToUser(dbUser);
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
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
      const defaultAdmin: Omit<DbUser, 'id'> = {
        username: 'admin',
        name: 'Administrator',
        password_hash: await PasswordService.hashPassword('admin'),
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
}
