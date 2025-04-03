
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
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*');
      
    if (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      throw error;
    }
    
    // Konvertieren der Supabase-Daten in das lokale User-Format
    return (users || []).map(this.convertToUserModel);
  }

  // Benutzer erstellen
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      // Direct insert approach since we now have proper RLS policies
      const { data, error } = await this.supabase
        .from('users')
        .insert([this.convertToSupabaseFormat(user)])
        .select()
        .single();
        
      if (error) {
        console.error('Fehler beim Erstellen des Benutzers:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned after user creation');
      }
      
      // Konvertieren und zurückgeben
      return this.convertToUserModel(data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Benutzer aktualisieren
  static async updateUser(user: User): Promise<User> {
    // Lade den Original-Benutzer, um die UUID zu erhalten
    const { data: originalUsers, error: fetchError } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', user.username)
      .limit(1);
      
    if (fetchError || !originalUsers || originalUsers.length === 0) {
      console.error('Fehler beim Finden des Benutzers:', fetchError);
      throw fetchError || new Error('Benutzer nicht gefunden');
    }
    
    const originalUser = originalUsers[0];
    
    // Aktualisiere den Benutzer
    const { data, error } = await this.supabase
      .from('users')
      .update(this.convertToSupabaseFormat(user))
      .eq('id', originalUser.id)
      .select()
      .single();
      
    if (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned after user update');
    }
    
    // Konvertieren und zurückgeben
    const updatedUser = this.convertToUserModel(data);
    updatedUser.id = user.id; // Behalte die lokale ID bei
    updatedUser.tournamentIds = user.tournamentIds; // Behalte die Turnierzuordnung bei
    
    return updatedUser;
  }

  // Benutzer löschen
  static async deleteUser(username: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('username', username);
      
    if (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      throw error;
    }
  }

  // Passwort ändern
  static async changePassword(username: string, newPassword: string): Promise<void> {
    const passwordHash = hashPassword(newPassword);
    
    const { error } = await this.supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('username', username);
      
    if (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      throw error;
    }
  }
}
