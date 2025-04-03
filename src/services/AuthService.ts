
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';

export class AuthService extends BaseSupabaseService {
  // Authenticate user
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', usernameOrEmail);
      
      // Fixed query to correctly escape parameters
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`);
        
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
      
      // Password verification with the verifyPassword function
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

  // Initialization: Add default users if none exist
  static async initializeUsers(): Promise<void> {
    try {
      console.log('Checking for existing users...');
      
      // Check if the 'users' table exists
      const { error: tableCheckError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.error('Users table does not exist, creating table...');
        return;
      }

      // Check if users already exist
      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Error checking existing users:', error);
        return;
      }
      
      // If no users exist, add default users
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No users found, adding default users...');
        
        const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi"; // Hash for "password"
        
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
            console.error('Error adding default users:', insertError);
          } else {
            console.log('Default users added successfully.');
          }
        } catch (insertError) {
          console.error('Error adding default users:', insertError);
        }
      } else {
        console.log('Users already exist, skipping initialization.');
      }
    } catch (error) {
      console.error('Error in initializeUsers:', error);
    }
  }
}
