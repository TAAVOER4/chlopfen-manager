
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword, hashPassword } from '@/utils/authUtils';
import { DatabaseUser } from './DatabaseUserTypes';
import { mapDatabaseUserToUser } from './UserMapper';

// Define a simple interface for the user data without recursion
interface AuthUserData {
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
        return this.validateAndReturnUser(usernameData[0] as AuthUserData, password);
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
            return this.validateAndReturnUser(emailData[0] as AuthUserData, password);
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
          return this.validateAndReturnUser(usernameWithEmailData[0] as AuthUserData, password);
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
  private static validateAndReturnUser(userData: AuthUserData, password: string): User | null {
    if (!userData) return null;
    
    console.log('Validating password for user:', userData.username);
    
    // Debug: Log password hash format
    console.log('Password hash format:', {
      hash: userData.password_hash.substring(0, 10) + '...',
      length: userData.password_hash.length,
      startsWithBcrypt: userData.password_hash.startsWith('$2')
    });
    
    // First, check if hash is actually a bcrypt hash (starts with $2a, $2b, $2y)
    const isBcryptHash = userData.password_hash.startsWith('$2a$') || 
                        userData.password_hash.startsWith('$2b$') || 
                        userData.password_hash.startsWith('$2y$');
    
    let passwordVerified = false;
    
    // Try both approaches - first secure password verification, then fallback to direct comparison
    if (isBcryptHash) {
      console.log('Attempting bcrypt password verification');
      
      try {
        passwordVerified = verifyPassword(password, userData.password_hash);
        console.log('Bcrypt password verification result:', passwordVerified);
      } catch (error) {
        console.error('Bcrypt verification error:', error);
      }
    } else {
      // If the hash doesn't look like bcrypt, check if the hash includes "DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI"
      // which is part of our default password hash
      console.log('Hash is not in bcrypt format, checking for default hash pattern');
      
      if (userData.password_hash.includes('DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI')) {
        console.log('Default hash pattern found, checking if password is "password"');
        passwordVerified = password === 'password';
        console.log('Default password verification result:', passwordVerified);
      } else {
        // Direct comparison as fallback for testing
        console.log('Attempting direct password comparison');
        passwordVerified = password === userData.password_hash;
        console.log('Direct comparison password verification result:', passwordVerified);
      }
    }
    
    if (passwordVerified) {
      console.log('Password matches, allowing login');
      const mappedUser = mapDatabaseUserToUser({
        id: userData.id,
        name: userData.name,
        username: userData.username,
        role: userData.role as UserRole,
        password_hash: userData.password_hash,
        individual_criterion: userData.individual_criterion as CriterionKey | null,
        group_criterion: userData.group_criterion as GroupCriterionKey | null,
        email: userData.email
      } as DatabaseUser);
      
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
