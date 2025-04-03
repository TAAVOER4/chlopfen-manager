import { BaseSupabaseService } from './BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';

export class AuthService extends BaseSupabaseService {
  // Benutzer authentifizieren
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', usernameOrEmail);
      
      // Direct query to get user with matching username or email
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
        .limit(1);
        
      if (error) {
        console.error('Error during authentication query:', error);
        return null;
      }
      
      if (!users || users.length === 0) {
        console.log('No user found with username or email:', usernameOrEmail);
        return null;
      }
      
      const user = users[0];
      console.log('Found user with username:', user.username);
      
      // Passwortüberprüfung mit der verifyPassword-Funktion
      if (verifyPassword(password, user.password_hash)) {
        console.log('Password matches, allowing login');
        
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
      console.log('Checking for existing users...');
      
      // Prüfe, ob die Tabelle 'users' existiert
      const { error: tableCheckError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.error('Users table does not exist, creating table...');
        return;
      }

      // Prüfe, ob bereits Benutzer vorhanden sind
      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Fehler beim Prüfen vorhandener Benutzer:', error);
        return;
      }
      
      // Wenn keine Benutzer vorhanden sind, füge die Standardbenutzer hinzu
      if (!existingUsers || existingUsers.length === 0) {
        console.log('Keine Benutzer gefunden, füge Standardbenutzer hinzu...');
        
        const defaultPasswordHash = "password";
        
        const defaultUsers = [
          {
            name: 'Administrator',
            username: 'admin',
            role: 'admin' as UserRole,
            password_hash: defaultPasswordHash,
            individual_criterion: null,
            group_criterion: null
          },
          {
            name: 'Erwin Vogel',
            username: 'erwin.vogel',
            email: 'erwinvogel@hotmail.com',
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
      } else {
        console.log('Benutzer bereits vorhanden, überspringe Initialisierung.');
      }
    } catch (error) {
      console.error('Error in initializeUsers:', error);
    }
  }
}
