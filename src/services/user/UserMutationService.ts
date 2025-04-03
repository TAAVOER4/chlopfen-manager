
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
      
      // If a plain password is provided, hash it before saving
      if (user.password) {
        console.log('Hashing new password for user update');
        userData.password_hash = hashPassword(user.password);
      } else if (!userData.password_hash) {
        // If updating without changing password, remove password_hash 
        // to avoid overwriting with empty value
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
      
      // Always hash the password before storing it
      const passwordHash = hashPassword(newPassword);
      
      console.log('Generated password hash:', passwordHash);
      
      // Log the SQL query that will be executed
      console.log('Executing update query with username:', username);
      
      // Add more detailed logging for debugging
      const beforeUpdate = await this.supabase
        .from('users')
        .select('username, password_hash')
        .eq('username', username)
        .single();
      
      console.log('Current user data before update:', beforeUpdate);
      
      // Update the password hash directly with more debug info
      const { data, error, status, statusText, count } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
      
      console.log('Update response:', { data, error, status, statusText, count });
        
      if (error) {
        console.error('Error changing password:', error);
        throw error;
      }
      
      // Verify the update was successful by fetching the updated record
      const afterUpdate = await this.supabase
        .from('users')
        .select('username, password_hash')
        .eq('username', username)
        .single();
      
      console.log('User data after update:', afterUpdate);
      
      if (afterUpdate.error) {
        console.warn('Could not verify password update:', afterUpdate.error);
      } else if (beforeUpdate.data?.password_hash === afterUpdate.data?.password_hash) {
        console.warn('Password hash did not change despite no error');
      } else {
        console.log('Password changed successfully for user:', username);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}
