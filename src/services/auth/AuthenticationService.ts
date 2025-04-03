
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { hashPassword } from '@/utils/authUtils';
import { AuthValidator } from './AuthValidator';
import { AuthUserData } from './types/AuthTypes';
import { mapDatabaseUserToUser } from './UserMapper';

/**
 * Service for handling user authentication
 */
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
        const userData = usernameData[0] as AuthUserData;
        return this.validateAndReturnUser(userData, password);
      }
      
      // Try alternative lookup methods
      return this.findUserByAlternativeMethods(usernameOrEmail, password);
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Try alternative methods to find a user (by email or username-as-email)
   */
  private static async findUserByAlternativeMethods(usernameOrEmail: string, password: string): Promise<User | null> {
    // Try by email if field exists
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
          const userData = emailData[0] as AuthUserData;
          return this.validateAndReturnUser(userData, password);
        }
      } else {
        console.log('Email field does not exist in users table, skipping email query');
      }
    } catch (emailQueryError) {
      console.error('Error checking for email field:', emailQueryError);
    }
    
    // Check if username field contains an email that matches
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
        const userData = usernameWithEmailData[0] as AuthUserData;
        return this.validateAndReturnUser(userData, password);
      }
    }
    
    return null;
  }
  
  /**
   * Helper method to validate password and return user
   */
  private static validateAndReturnUser(userData: AuthUserData, password: string): User | null {
    if (!userData) return null;
    
    console.log('Validating password for user:', userData.username);
    
    // Debug: Log password hash format
    console.log('Password hash format:', {
      hash: userData.password_hash?.substring(0, 10) + '...',
      length: userData.password_hash?.length,
      startsWithBcrypt: userData.password_hash?.startsWith('$2')
    });
    
    if (AuthValidator.verifyPassword(password, userData.password_hash)) {
      console.log('Password matches, allowing login');
      const mappedUser = mapDatabaseUserToUser(userData);
      
      console.log('User mapped to application User type:', {
        ...mappedUser,
        passwordHash: '[REDACTED]'
      });
      return mappedUser;
    }
    
    console.log('Password did not match');
    return null;
  }

  /**
   * Generate and return a bcrypt hash for a password
   */
  static generatePasswordHash(password: string): string {
    try {
      // Generate hash using the hashPassword utility function directly
      const hash = hashPassword(password);
      
      // Log the hash for debugging
      console.log('Generated password hash for debugging:');
      console.log('Password:', password);
      console.log('Hash:', hash);
      console.log('Hash length:', hash.length);
      console.log('Is bcrypt format:', hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'));
      
      return hash;
    } catch (error) {
      console.error('Error generating password hash:', error);
      return 'Error generating hash';
    }
  }
}
