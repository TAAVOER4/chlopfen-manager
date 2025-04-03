
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
      
      // Make sure we have a password hash or generate one if plain password was provided
      if (!userData.password_hash && user.password) {
        // Hash the password if a plain password was provided
        console.log('Hashing provided password for new user');
        userData.password_hash = hashPassword(user.password);
      } else if (!userData.password_hash) {
        throw new Error('Password is required for new users');
      }
      
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select();
        
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
      
      // If a plain password is provided, hash it before saving
      if (user.password) {
        console.log('Hashing new password for user update');
        userData.password_hash = hashPassword(user.password);
      } else {
        // If updating without changing password, remove password_hash 
        // to avoid overwriting with empty value
        delete userData.password_hash;
      }
      
      const { data, error } = await this.supabase
        .from('users')
        .update(userData)
        .eq('username', user.username)
        .select();
        
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
        .eq('username', username);
        
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
}
