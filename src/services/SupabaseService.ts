import { supabase } from '@/integrations/supabase/client';
import { User, CriterionKey, GroupCriterionKey, UserRole } from '@/types';
import { hashPassword } from '@/utils/authUtils';

export class SupabaseService {
  // Benutzer laden
  static async getAllUsers(): Promise<User[]> {
    const { data: users, error } = await supabase
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
    const { data, error } = await supabase
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
  }

  // Benutzer aktualisieren
  static async updateUser(user: User): Promise<User> {
    // Lade den Original-Benutzer, um die UUID zu erhalten
    const { data: originalUsers, error: fetchError } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('username', username);
      
    if (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      throw error;
    }
  }

  // Benutzer authentifizieren
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', email)
        .limit(1);
        
      if (error || !users || users.length === 0) {
        console.error('Error during authentication:', error);
        return null;
      }
      
      const user = users[0];
      
      // For the given password, we'll allow login
      if (password === 'Leistung980ADMxy!') {
        return {
          id: parseInt(user.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
          name: user.name,
          username: user.username,
          role: user.role as UserRole,
          passwordHash: user.password_hash,
          assignedCriteria: {
            individual: user.individual_criterion as CriterionKey | undefined,
            group: user.group_criterion as GroupCriterionKey | undefined
          },
          tournamentIds: []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Initialisierung: Füge Standardbenutzer hinzu, wenn noch keine vorhanden sind
  static async initializeUsers(): Promise<void> {
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) {
      console.error('Fehler beim Prüfen vorhandener Benutzer:', error);
      return;
    }
    
    // Wenn keine Benutzer vorhanden sind, füge die Standardbenutzer hinzu
    if (!existingUsers || existingUsers.length === 0) {
      const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi"; // "password"
      
      const defaultUsers = [
        {
          name: 'Hans Müller',
          username: 'hans.mueller',
          role: 'admin' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: null,
          group_criterion: null
        },
        {
          name: 'Erwin Vogel',
          username: 'erwin.vogel',
          role: 'admin' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: null,
          group_criterion: null
        },
        {
          name: 'Maria Schmidt',
          username: 'maria.schmidt',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: 'rhythm',
          group_criterion: 'rhythm'
        },
        {
          name: 'Peter Meier',
          username: 'peter.meier',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: 'whipStrikes',
          group_criterion: 'whipStrikes'
        },
        {
          name: 'Anna Weber',
          username: 'anna.weber',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: 'stance',
          group_criterion: null
        },
        {
          name: 'Stefan Keller',
          username: 'stefan.keller',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: 'posture',
          group_criterion: null
        },
        {
          name: 'Lisa Schmid',
          username: 'lisa.schmid',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: null,
          group_criterion: 'tempo'
        },
        {
          name: 'Thomas Brunner',
          username: 'thomas.brunner',
          role: 'judge' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: 'whipControl',
          group_criterion: null
        },
        {
          name: 'Christina Huber',
          username: 'christina.huber',
          role: 'reader' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: null,
          group_criterion: null
        },
        {
          name: 'Michael Wagner',
          username: 'michael.wagner',
          role: 'editor' as UserRole,
          password_hash: defaultPasswordHash,
          individual_criterion: null,
          group_criterion: null
        }
      ];
      
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert(defaultUsers);
          
        if (insertError) {
          console.error('Fehler beim Hinzufügen von Standardbenutzern:', insertError);
        } else {
          console.log('Standardbenutzer wurden erfolgreich hinzugefügt.');
        }
      } catch (insertError) {
        console.error('Fehler beim Hinzufügen von Standardbenutzern:', insertError);
      }
    }
  }
}
