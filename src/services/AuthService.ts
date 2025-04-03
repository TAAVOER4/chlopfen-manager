
import { BaseSupabaseService } from './BaseSupabaseService';
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { verifyPassword } from '@/utils/authUtils';

interface DatabaseUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password_hash: string;
  individual_criterion: CriterionKey | null;
  group_criterion: GroupCriterionKey | null;
  email?: string; // Optional email field that might be present
}

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
      
      // First try - exact match on username
      const { data: usernameUsers, error: usernameError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1);
      
      if (usernameError) {
        console.error('Error during username query:', usernameError);
      }
      
      // If username match found, validate password
      if (usernameUsers && usernameUsers.length > 0) {
        // Use explicit type assertion to break the recursive type inference
        const user = usernameUsers[0] as unknown as DatabaseUser;
        return this.validateAndReturnUser(user, password);
      }
      
      // Second try - match on email field
      const { data: emailUsers, error: emailError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', usernameOrEmail)
        .limit(1);
      
      if (emailError) {
        console.error('Error during email query:', emailError);
      }
      
      // If email match found, validate password
      if (emailUsers && emailUsers.length > 0) {
        // Use explicit type assertion to break the recursive type inference
        const user = emailUsers[0] as unknown as DatabaseUser;
        return this.validateAndReturnUser(user, password);
      }
      
      // Last try - check if username field contains an email that matches
      if (usernameOrEmail.includes('@')) {
        const { data: usernameWithEmailUsers, error: usernameWithEmailError } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', usernameOrEmail)
          .limit(1);
        
        if (usernameWithEmailError) {
          console.error('Error during username-with-email query:', usernameWithEmailError);
        }
        
        // If found, validate password
        if (usernameWithEmailUsers && usernameWithEmailUsers.length > 0) {
          // Use explicit type assertion to break the recursive type inference
          const user = usernameWithEmailUsers[0] as unknown as DatabaseUser;
          return this.validateAndReturnUser(user, password);
        }
      }
      
      console.log('No user found with username or email:', usernameOrEmail);
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  // Helper method to validate password and return user
  private static validateAndReturnUser(user: DatabaseUser, password: string): User | null {
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
