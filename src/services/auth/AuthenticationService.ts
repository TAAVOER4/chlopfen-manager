
import { BaseSupabaseService } from '../BaseSupabaseService';
import { User } from '@/types';
import { verifyPassword } from '@/utils/authUtils';
import { DatabaseUser } from './DatabaseUserTypes';
import { mapDatabaseUserToUser } from './UserMapper';

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
      const { data: usernameData, error: usernameError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1) as any;
      
      if (usernameError) {
        console.error('Error during username query:', usernameError);
      }
      
      // If username match found, validate password
      if (usernameData && usernameData.length > 0) {
        return this.validateAndReturnUser(usernameData[0], password);
      }
      
      // Second try - match on email field
      const { data: emailData, error: emailError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', usernameOrEmail)
        .limit(1) as any;
      
      if (emailError) {
        console.error('Error during email query:', emailError);
      }
      
      // If email match found, validate password
      if (emailData && emailData.length > 0) {
        return this.validateAndReturnUser(emailData[0], password);
      }
      
      // Last try - check if username field contains an email that matches
      if (usernameOrEmail.includes('@')) {
        const { data: usernameWithEmailData, error: usernameWithEmailError } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', usernameOrEmail)
          .limit(1) as any;
        
        if (usernameWithEmailError) {
          console.error('Error during username-with-email query:', usernameWithEmailError);
        }
        
        // If found, validate password
        if (usernameWithEmailData && usernameWithEmailData.length > 0) {
          return this.validateAndReturnUser(usernameWithEmailData[0], password);
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
  private static validateAndReturnUser(userData: any, password: string): User | null {
    if (!userData) return null;
    
    const user: DatabaseUser = {
      id: String(userData.id),
      name: String(userData.name),
      username: String(userData.username),
      role: userData.role,
      password_hash: String(userData.password_hash),
      individual_criterion: userData.individual_criterion,
      group_criterion: userData.group_criterion,
      email: userData.email
    };
    
    console.log('Found user with username:', user.username);
    
    // Verify password
    const passwordVerified = verifyPassword(password, user.password_hash);
    console.log('Password verification result:', passwordVerified);
    
    if (passwordVerified) {
      console.log('Password matches, allowing login');
      return mapDatabaseUserToUser(user);
    }
    
    console.log('Password did not match');
    return null;
  }
}
