
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, CriterionKey, GroupCriterionKey, UserRole } from '@/types';
import { hashPassword } from '@/utils/authUtils';

export class UserService extends BaseSupabaseService {
  // Convert Supabase user data to our User model
  private static convertToUserModel(userData: any): User {
    return {
      id: parseInt(userData.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
      name: userData.name,
      username: userData.username,
      role: userData.role as UserRole,
      passwordHash: userData.password_hash,
      assignedCriteria: {
        individual: userData.individual_criterion as CriterionKey | undefined,
        group: userData.group_criterion as GroupCriterionKey | undefined
      },
      tournamentIds: [] // These are loaded separately
    };
  }

  // Convert our User model to Supabase format
  private static convertToSupabaseFormat(user: Omit<User, 'id'> | User) {
    return {
      name: user.name,
      username: user.username,
      password_hash: user.passwordHash,
      role: user.role,
      individual_criterion: user.assignedCriteria?.individual,
      group_criterion: user.assignedCriteria?.group
    };
  }

  // Benutzer laden
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from Supabase');
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*');
        
      if (error) {
        console.error('Fehler beim Laden der Benutzer:', error);
        throw error;
      }
      
      if (!users || users.length === 0) {
        console.log('No users found in database');
        return [];
      }
      
      console.log(`Found ${users.length} users in database`);
      
      // Konvertieren der Supabase-Daten in das lokale User-Format
      return users.map(this.convertToUserModel);
    } catch (error) {
      console.error('Error while fetching users:', error);
      throw error;
    }
  }

  // Benutzer erstellen
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('Creating new user:', user.username);
      // Direct insert approach since we now have proper RLS policies
      const { data, error } = await this.supabase
        .from('users')
        .insert([this.convertToSupabaseFormat(user)])
        .select();
        
      if (error) {
        console.error('Fehler beim Erstellen des Benutzers:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after user creation');
      }
      
      console.log('User created successfully:', data[0].username);
      
      // Konvertieren und zurückgeben
      return this.convertToUserModel(data[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Benutzer aktualisieren
  static async updateUser(user: User): Promise<User> {
    try {
      console.log('Updating user:', user.username);
      
      const { data, error } = await this.supabase
        .from('users')
        .update(this.convertToSupabaseFormat(user))
        .eq('username', user.username)
        .select();
        
      if (error) {
        console.error('Fehler beim Aktualisieren des Benutzers:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after user update');
      }
      
      console.log('User updated successfully:', data[0].username);
      
      // Konvertieren und zurückgeben
      const updatedUser = this.convertToUserModel(data[0]);
      updatedUser.id = user.id; // Behalte die lokale ID bei
      updatedUser.tournamentIds = user.tournamentIds; // Behalte die Turnierzuordnung bei
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Benutzer löschen
  static async deleteUser(username: string): Promise<void> {
    try {
      console.log('Deleting user:', username);
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('username', username);
        
      if (error) {
        console.error('Fehler beim Löschen des Benutzers:', error);
        throw error;
      }
      
      console.log('User deleted successfully:', username);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Passwort ändern
  static async changePassword(username: string, newPassword: string): Promise<void> {
    try {
      console.log('Changing password for user:', username);
      const passwordHash = hashPassword(newPassword);
      
      const { error } = await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username);
        
      if (error) {
        console.error('Fehler beim Ändern des Passworts:', error);
        throw error;
      }
      
      console.log('Password changed successfully for user:', username);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}
