
import { User } from '@/types';
import { AuthenticationService } from './auth/AuthenticationService';
import { InitializationService } from './auth/InitializationService';
import { PasswordService } from './auth/PasswordService';
import { BaseSupabaseService } from './BaseSupabaseService';

export class AuthService extends BaseSupabaseService {
  // Authentication methods
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    return AuthenticationService.authenticateUser(usernameOrEmail, password);
  }

  // User password management
  static async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    return PasswordService.updateUserPassword(username, newPassword);
  }

  // Initialization methods
  static async initializeUsers(): Promise<void> {
    return InitializationService.initializeUsers();
  }
}
