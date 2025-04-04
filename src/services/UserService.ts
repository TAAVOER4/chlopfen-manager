
import { BaseSupabaseService } from './BaseSupabaseService';
import { User } from '@/types';
import { hashPassword } from '@/utils/authUtils';

export class UserService extends BaseSupabaseService {
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('Initializing and fetching users...');
      
      // Check if users exist
      console.log('Checking for existing users...');
      const { data: existingUsers, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (checkError) {
        console.error('Error checking for users:', checkError);
        return [];
      }
      
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No users found, initializing default admin user...');
        await this.initializeDefaultAdmin();
      } else {
        console.log('Users already exist, skipping initialization.');
      }
      
      // Fetch all users
      console.log('Fetching all users from Supabase');
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*');
        
      if (error) {
        console.error('Error loading users:', error);
        return [];
      }
      
      if (!users || users.length === 0) {
        console.log('No users found in database');
        return [];
      }
      
      // For each user, get their assigned tournaments
      const usersWithTournaments = await Promise.all(users.map(async (user) => {
        const { data: userTournaments, error: tournamentsError } = await this.supabase
          .from('user_tournaments')
          .select('tournament_id')
          .eq('user_id', user.id);
          
        const tournamentIds = userTournaments && !tournamentsError 
          ? userTournaments.map(t => t.tournament_id) 
          : [];
          
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          passwordHash: user.password_hash,
          assignedCriteria: {
            individual: user.individual_criterion,
            group: user.group_criterion
          },
          tournamentIds
        };
      }));
      
      console.log('Found', users.length, 'users in database');
      console.log('Loaded users:', usersWithTournaments);
      
      return usersWithTournaments;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }
  
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
      
      // Then, if there are tournament IDs, create the user-tournament relationships
      if (user.tournamentIds && user.tournamentIds.length > 0) {
        const tournamentEntries = user.tournamentIds.map(tournamentId => ({
          user_id: newUser.id,
          tournament_id: tournamentId
        }));
        
        const { error: tournamentError } = await this.supabase
          .from('user_tournaments')
          .insert(tournamentEntries);
          
        if (tournamentError) {
          console.error('Error assigning tournaments to user:', tournamentError);
          // We don't throw here because the user was created successfully
        }
      }
      
      // Return the user with the assigned tournaments
      return {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        passwordHash: newUser.password_hash,
        assignedCriteria: {
          individual: newUser.individual_criterion,
          group: newUser.group_criterion
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
      console.log('Updating user:', user.username);
      
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
        .eq('username', user.username)
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
          .eq('username', user.username);
          
        if (passwordError) {
          console.error('Error updating password:', passwordError);
          throw passwordError;
        }
      }
      
      // Update tournament assignments
      // First, delete all existing assignments
      const { error: deleteError } = await this.supabase
        .from('user_tournaments')
        .delete()
        .eq('user_id', updatedUser.id);
        
      if (deleteError) {
        console.error('Error deleting tournament assignments:', deleteError);
        throw deleteError;
      }
      
      // Then, create new assignments if there are any
      if (user.tournamentIds && user.tournamentIds.length > 0) {
        const tournamentEntries = user.tournamentIds.map(tournamentId => ({
          user_id: updatedUser.id,
          tournament_id: tournamentId
        }));
        
        const { error: insertError } = await this.supabase
          .from('user_tournaments')
          .insert(tournamentEntries);
          
        if (insertError) {
          console.error('Error adding tournament assignments:', insertError);
          throw insertError;
        }
      }
      
      console.log('User updated successfully:', updatedUser);
      
      // Return the updated user with the new tournament assignments
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        role: updatedUser.role,
        passwordHash: updatedUser.password_hash,
        assignedCriteria: {
          individual: updatedUser.individual_criterion,
          group: updatedUser.group_criterion
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
      
      // Delete tournament assignments first
      const { error: tournamentError } = await this.supabase
        .from('user_tournaments')
        .delete()
        .eq('user_id', user.id);
        
      if (tournamentError) {
        console.error('Error deleting tournament assignments:', tournamentError);
        // We continue even if there's an error here
      }
      
      // Then delete the user
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('username', username);
        
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
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await this.supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('username', username);
        
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
  
  private static async initializeDefaultAdmin(): Promise<void> {
    try {
      const defaultAdmin = {
        name: 'Administrator',
        username: 'admin',
        password_hash: hashPassword('admin'),
        role: 'admin',
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
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
}
