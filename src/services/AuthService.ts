
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';

export class AuthService extends BaseSupabaseService {
  // Authenticate user
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', usernameOrEmail);
      
      // Check for empty inputs
      if (!usernameOrEmail || !password) {
        console.error('Missing username/email or password');
        return null;
      }
      
      // More robust query for the user - check both username and email fields
      // Use separate queries for exact match and case-insensitive search
      const { data: exactMatchUsers, error: exactMatchError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1);
        
      // If exact match error, log and continue with case-insensitive search
      if (exactMatchError) {
        console.error('Error during exact match query:', exactMatchError);
      }
      
      // If we found an exact match, use that
      if (exactMatchUsers && exactMatchUsers.length > 0) {
        return this.validateAndReturnUser(exactMatchUsers[0], password);
      }
      
      // If no exact match, try case-insensitive search
      const { data: caseInsensitiveUsers, error: caseInsensitiveError } = await this.supabase
        .from('users')
        .select('*')
        .ilike('username', usernameOrEmail)
        .limit(1);
        
      // If case-insensitive match error, log and return null
      if (caseInsensitiveError) {
        console.error('Error during case-insensitive query:', caseInsensitiveError);
        return null;
      }
      
      // If we found a case-insensitive match, use that
      if (caseInsensitiveUsers && caseInsensitiveUsers.length > 0) {
        return this.validateAndReturnUser(caseInsensitiveUsers[0], password);
      }
      
      // If still no match, try as email
      const { data: emailUsers, error: emailError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1);
        
      // If email match error, log and return null
      if (emailError) {
        console.error('Error during email query:', emailError);
        return null;
      }
      
      // If we found an email match, use that
      if (emailUsers && emailUsers.length > 0) {
        return this.validateAndReturnUser(emailUsers[0], password);
      }
      
      console.log('No user found with username or email:', usernameOrEmail);
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  // Helper method to validate password and return user
  private static validateAndReturnUser(user: any, password: string): User | null {
    if (!user) return null;
    
    console.log('Found user with username:', user.username);
    
    // Verify password
    const passwordVerified = verifyPassword(password, user.password_hash);
    console.log('Password verification result:', passwordVerified);
    
    if (passwordVerified) {
      console.log('Password matches, allowing login');
      
      const userResult: User = {
        id: parseInt(user.id.toString().substring(0, 8), 16) % 1000,
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
            username: 'erwin.vogel@hotmail.com',
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
