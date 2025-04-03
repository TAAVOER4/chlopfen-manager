
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { UserMapper } from './UserMapper';
import { hashPassword } from '@/utils/authUtils';

export class UserMutationService extends BaseSupabaseService {
  /**
   * Creates a new user
   */
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('Creating new user:', user.username);
      
      // Map user to Supabase format, converting passwordHash to password_hash
      const userData = UserMapper.toSupabaseFormat(user);
      
      // Make sure we have a password hash
      if (!userData.password_hash) {
        throw new Error('Password is required for new users');
      }
      
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select() as any;
        
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after user creation');
      }
      
      console.log('User created successfully:', data[0].username);
      
      return UserMapper.toUserModel(data[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Updates an existing user
   */
  static async updateUser(user: User): Promise<User> {
    try {
      console.log('Updating user:', user.username);
      
      // Convert user to Supabase format
      const userData = UserMapper.toSupabaseFormat(user);
      
      // If updating without changing password, remove password_hash 
      // to avoid overwriting with empty value
      if (!userData.password_hash) {
        delete userData.password_hash;
      }
      
      const { data, error } = await this.supabase
        .from('users')
        .update(userData)
        .eq('username', user.username)
        .select() as any;
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after user update');
      }
      
      console.log('User updated successfully:', data[0].username);
      
      // Convert and return
      const updatedUser = UserMapper.toUserModel(data[0]);
      updatedUser.id = user.id; // Keep the local ID 
      updatedUser.tournamentIds = user.tournamentIds; // Keep tournament assignments
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deletes a user by username
   */
  static async deleteUser(username: string): Promise<void> {
    try {
      console.log('Deleting user:', username);
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('username', username) as any;
        
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      console.log('User deleted successfully:', username);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Changes a user's password
   */
  static async changePassword(username: string, newPassword: string): Promise<void> {
    try {
      console.log('Changing password for user:', username);
      const passwordHash = hashPassword(newPassword);
      
      console.log('Generated password hash:', passwordHash);
      
      const { data, error } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username)
        .select() as any;
        
      if (error) {
        console.error('Error changing password:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Password changed successfully for user:', username);
      } else {
        console.warn('No data returned after password update, user might not exist:', username);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}
