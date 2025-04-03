
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { UserMapper } from './UserMapper';
import { hashPassword } from '@/utils/authUtils';

export class UserMutationService extends BaseSupabaseService {
  /**
   * Creates a new user in the database
   */
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('Creating new user:', user.username);
      
      // Hash the password if it's not already hashed
      let passwordHash = user.passwordHash;
      if (!passwordHash?.startsWith('$2')) {
        passwordHash = hashPassword(passwordHash || 'default');
      }
      
      // Map our User model to the database schema
      const dbUser = {
        name: user.name,
        username: user.username,
        password_hash: passwordHash,
        role: user.role,
        individual_criterion: user.assignedCriteria?.individual || null,
        group_criterion: user.assignedCriteria?.group || null
      };
      
      // Insert the user into the database
      const { data, error } = await this.supabase
        .from('users')
        .insert([dbUser])
        .select();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from user creation');
      }
      
      console.log('User created successfully:', data[0]);
      
      // Convert the database object back to our User model
      return UserMapper.toUserModel(data[0]);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Updates an existing user in the database
   */
  static async updateUser(user: User): Promise<User> {
    try {
      console.log('Updating user:', user.username);
      
      // Map our User model to the database schema
      const dbUser = {
        name: user.name,
        username: user.username,
        role: user.role,
        individual_criterion: user.assignedCriteria?.individual || null,
        group_criterion: user.assignedCriteria?.group || null
      };
      
      // Update the user in the database
      const { data, error } = await this.supabase
        .from('users')
        .update(dbUser)
        .eq('username', user.username)
        .select();
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from user update');
      }
      
      console.log('User updated successfully:', data[0]);
      
      // Convert the database object back to our User model
      return UserMapper.toUserModel(data[0]);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  /**
   * Deletes a user from the database
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
      
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }
}
