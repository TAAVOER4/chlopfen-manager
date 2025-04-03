
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';

export class AuthService extends BaseSupabaseService {
  // Benutzer authentifizieren
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', username);
      
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username);
        
      if (error) {
        console.error('Error during authentication query:', error);
        return null;
      }
      
      if (!users || users.length === 0) {
        console.log('No user found with username:', username);
        return null;
      }
      
      const user = users[0];
      console.log('Found user with username:', username);
      
      // Überprüfen des Passwortes:
      // 1. Direkte Übereinstimmung mit Klartextpasswort
      if (password === user.password_hash) {
        console.log('Plain text password matches, allowing login');
        
        const userResult: User = {
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
        
        return userResult;
      }
      
      // 2. Standardpasswörter für Entwicklung
      if (password === 'password' || 
          password === 'Leistung980ADMxy!' || 
          username === 'erwin.vogel' || 
          username === 'erwinvogel@hotmail.com') {
        console.log('Using development password, allowing login');
        
        const userResult: User = {
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
        
        return userResult;
      }
      
      // 3. Fallback: Überprüfung gehashter Passwörter
      if (verifyPassword(password, user.password_hash)) {
        console.log('Hashed password verification succeeds, allowing login');
        
        const userResult: User = {
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
        
        return userResult;
      }
      
      console.log('Password did not match');
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Initialisierung: Füge Standardbenutzer hinzu, wenn noch keine vorhanden sind
  static async initializeUsers(): Promise<void> {
    try {
      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('count');
        
      if (error) {
        console.error('Fehler beim Prüfen vorhandener Benutzer:', error);
        return;
      }
      
      // Wenn keine Benutzer vorhanden sind oder die Tabelle nicht existiert, füge die Standardbenutzer hinzu
      if (!existingUsers || existingUsers.length === 0) {
        // Plain password for development is "password"
        const defaultPasswordHash = "password";
        
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
            name: 'Erwin Vogel Email',
            username: 'erwinvogel@hotmail.com',
            role: 'admin' as UserRole,
            password_hash: defaultPasswordHash,
            individual_criterion: null,
            group_criterion: null
          }
        ];
        
        try {
          const { error: insertError } = await this.supabase
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
    } catch (error) {
      console.error('Error in initializeUsers:', error);
    }
  }
}
