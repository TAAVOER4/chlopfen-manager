
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';
import { DatabaseUser } from './DatabaseUserTypes';
import { mapDatabaseUserToUser } from './UserMapper';

interface UserData {
  id: string;
  name: string;
  username: string;
  role: string;
  password_hash: string;
  individual_criterion?: string | null;
  group_criterion?: string | null;
  email?: string;
}

export class AuthenticationService extends BaseSupabaseService {
  /**
   * Authenticate user by username/email and password
   */
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', usernameOrEmail);
      
      // Check for empty inputs 
      if (!usernameOrEmail || !password) {
        console.error('Missing username/email or password');
        return null;
      }
      
      // First try - exact match on username
      console.log('Querying by username:', usernameOrEmail);
      const { data: usernameData, error: usernameError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1);
      
      console.log('Username query result:', { data: usernameData, error: usernameError });
      
      if (usernameError) {
        console.error('Error during username query:', usernameError);
      }
      
      // If username match found, validate password
      if (usernameData && usernameData.length > 0) {
        console.log('Found user by username match');
        return this.validateAndReturnUser(usernameData[0] as UserData, password);
      }
      
      // Second try - if database has email field, try matching on that
      try {
        console.log('Checking if email field exists in users table...');
        const { error: checkEmailFieldError } = await this.supabase
          .from('users')
          .select('email')
          .limit(1);
        
        if (!checkEmailFieldError) {
          console.log('Email field exists, querying by email:', usernameOrEmail);
          const { data: emailData, error: emailError } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', usernameOrEmail)
            .limit(1);
          
          console.log('Email query result:', { data: emailData, error: emailError });
          
          if (emailError) {
            console.error('Error during email query:', emailError);
          }
          
          // If email match found, validate password
          if (emailData && emailData.length > 0) {
            console.log('Found user by email match');
            return this.validateAndReturnUser(emailData[0] as UserData, password);
          }
        } else {
          console.log('Email field does not exist in users table, skipping email query');
        }
      } catch (emailQueryError) {
        console.error('Error checking for email field:', emailQueryError);
      }
      
      // Last try - check if username field contains an email that matches
      if (usernameOrEmail.includes('@')) {
        console.log('Input looks like email, trying username-as-email match');
        const { data: usernameWithEmailData, error: usernameWithEmailError } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', usernameOrEmail)
          .limit(1);
        
        console.log('Username-as-email query result:', { 
          data: usernameWithEmailData, 
          error: usernameWithEmailError 
        });
        
        if (usernameWithEmailError) {
          console.error('Error during username-with-email query:', usernameWithEmailError);
        }
        
        // If found, validate password
        if (usernameWithEmailData && usernameWithEmailData.length > 0) {
          console.log('Found user by username-as-email match');
          return this.validateAndReturnUser(usernameWithEmailData[0] as UserData, password);
        }
      }
      
      console.log('No user found with username or email:', usernameOrEmail);
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  /**
   * Helper method to validate password and return user
   */
  private static validateAndReturnUser(userData: UserData, password: string): User | null {
    if (!userData) return null;
    
    console.log('Validating password for user:', userData.username);
    
    const user: DatabaseUser = {
      id: String(userData.id),
      name: String(userData.name),
      username: String(userData.username),
      role: userData.role as UserRole,
      password_hash: String(userData.password_hash),
      individual_criterion: userData.individual_criterion as CriterionKey | null,
      group_criterion: userData.group_criterion as GroupCriterionKey | null,
      email: userData.email
    };
    
    console.log('User data mapped to DatabaseUser type:', {
      ...user,
      password_hash: '[REDACTED]'
    });
    
    // Verify password
    const passwordVerified = verifyPassword(password, user.password_hash);
    console.log('Password verification result:', passwordVerified);
    
    if (passwordVerified) {
      console.log('Password matches, allowing login');
      const mappedUser = mapDatabaseUserToUser(user);
      console.log('User mapped to application User type:', {
        ...mappedUser,
        passwordHash: '[REDACTED]'
      });
      return mappedUser;
    }
    
    console.log('Password did not match');
    return null;
  }
}
