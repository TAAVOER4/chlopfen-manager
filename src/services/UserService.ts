
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, CriterionKey, GroupCriterionKey, UserRole } from '@/types';
import { hashPassword } from '@/utils/authUtils';

export class UserService extends BaseSupabaseService {
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
    return (users || []).map(user => ({
      id: parseInt(user.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000, // Einfache Umwandlung der UUID zu einer Zahl für die Frontend-ID
      name: user.name,
      username: user.username,
      role: user.role as UserRole,
      passwordHash: user.password_hash,
      assignedCriteria: {
        individual: user.individual_criterion as CriterionKey | undefined,
        group: user.group_criterion as GroupCriterionKey | undefined
      },
      tournamentIds: [] // Diese werden separat geladen
    }));
  }

  // Benutzer erstellen
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      // Direct insert approach since we now have proper RLS policies
      const { data, error } = await this.supabase
        .from('users')
        .insert([{
          name: user.name,
          username: user.username,
          password_hash: user.passwordHash,
          role: user.role,
          individual_criterion: user.assignedCriteria?.individual,
          group_criterion: user.assignedCriteria?.group
        }])
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
      return {
        id: parseInt(data.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
        name: data.name,
        username: data.username,
        role: data.role as UserRole,
        passwordHash: data.password_hash,
        assignedCriteria: {
          individual: data.individual_criterion as CriterionKey | undefined,
          group: data.group_criterion as GroupCriterionKey | undefined
        },
        tournamentIds: []
      };
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
      .update({
        name: user.name,
        username: user.username,
        password_hash: user.passwordHash,
        role: user.role,
        individual_criterion: user.assignedCriteria?.individual,
        group_criterion: user.assignedCriteria?.group
      })
      .eq('id', originalUser.id)
      .select()
      .single();
      
    if (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
      throw error;
    }
    
    // Konvertieren und zurückgeben
    return {
      id: user.id, // Behalte die lokale ID bei
      name: data.name,
      username: data.username,
      role: data.role as UserRole,
      passwordHash: data.password_hash,
      assignedCriteria: {
        individual: data.individual_criterion as CriterionKey | undefined,
        group: data.group_criterion as GroupCriterionKey | undefined
      },
      tournamentIds: user.tournamentIds
    };
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
