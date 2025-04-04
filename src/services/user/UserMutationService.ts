
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User, UserRole } from '@/types';
import { hashPassword } from '@/utils/authUtils';
import { updateUserTournaments } from './UserTournamentService';

export class UserMutationService extends BaseSupabaseService {
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      // Hash the password if it's not already hashed
      let passwordHash = user.passwordHash || '';
      if (user.password && !user.password.startsWith('$2')) {
        passwordHash = hashPassword(user.password);
      }
      
      // Create the user record first
      const { data: newUser, error } = await this.supabase
        .from('users')
        .insert({
          name: user.name,
          username: user.username,
          password_hash: passwordHash,
          role: user.role,
          individual_criterion: user.assignedCriteria?.individual || null,
          group_criterion: user.assignedCriteria?.group || null
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      if (!newUser) {
        throw new Error('No data returned from user creation');
      }

      // Assign tournaments to the user
      if (user.tournamentIds && user.tournamentIds.length > 0) {
        await updateUserTournaments(newUser.id, user.tournamentIds);
      }
      
      // Return the user with the assigned tournaments
      return {
        id: parseInt(newUser.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role as UserRole,
        passwordHash: newUser.password_hash,
        assignedCriteria: {
          individual: newUser.individual_criterion as any,
          group: newUser.group_criterion as any
        },
        tournamentIds: user.tournamentIds || []
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  static async updateUser(user: User): Promise<User> {
    try {
      console.log('Updating user:', user);
      
      // Convert numeric ID to string format for Supabase
      // This is a workaround for the ID mismatch between our app and Supabase
      // In a production environment, we would use consistent ID formats
      const { data: userRecord, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', user.username)
        .single();
        
      if (userError || !userRecord) {
        console.error('Error finding user for update:', userError);
        throw userError || new Error('User not found');
      }
      
      const userIdString = userRecord.id;
      
      // Update the user record
      const { data: updatedUser, error } = await this.supabase
        .from('users')
        .update({
          name: user.name,
          username: user.username,
          role: user.role,
          individual_criterion: user.assignedCriteria?.individual || null,
          group_criterion: user.assignedCriteria?.group || null
        })
        .eq('id', userIdString)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      if (!updatedUser) {
        throw new Error('No data returned from user update');
      }
      
      // Update password if provided
      if (user.password) {
        const hashedPassword = hashPassword(user.password);
        const { error: passwordError } = await this.supabase
          .from('users')
          .update({ password_hash: hashedPassword })
          .eq('id', userIdString);
          
        if (passwordError) {
          console.error('Error updating password:', passwordError);
          throw passwordError;
        }
      }
      
      // Update tournament assignments
      await updateUserTournaments(userIdString, user.tournamentIds || []);
      
      console.log('User updated successfully:', updatedUser);
      
      // Return the updated user with the new tournament assignments
      return {
        id: parseInt(updatedUser.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
        name: updatedUser.name,
        username: updatedUser.username,
        role: updatedUser.role as UserRole,
        passwordHash: updatedUser.password_hash,
        assignedCriteria: {
          individual: updatedUser.individual_criterion as any,
          group: updatedUser.group_criterion as any
        },
        tournamentIds: user.tournamentIds || []
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  static async deleteUser(username: string): Promise<void> {
    try {
      // Get the user ID first
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (userError || !user) {
        console.error('Error getting user ID for deletion:', userError);
        throw userError || new Error('User not found');
      }
      
      // Delete the user (tournament assignments will be deleted by cascade)
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', user.id);
        
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  static async changePassword(username: string, newPassword: string): Promise<boolean> {
    try {
      // Get the user ID first to ensure we're changing the password for the right user
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (userError || !user) {
        console.error('Error getting user for password change:', userError);
        return false;
      }
      
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await this.supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error changing password:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }
}
