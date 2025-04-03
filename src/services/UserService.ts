
import { User } from '@/types';
import { UserQueryService } from './user/UserQueryService';
import { UserMutationService } from './user/UserMutationService';
import { PasswordService } from './auth/PasswordService';

/**
 * Facade for user-related services
 */
export class UserService {
  // Query operations
  static async getAllUsers(): Promise<User[]> {
    return UserQueryService.getAllUsers();
  }

  // Mutation operations
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    return UserMutationService.createUser(user);
  }

  static async updateUser(user: User): Promise<User> {
    return UserMutationService.updateUser(user);
  }

  static async deleteUser(username: string): Promise<void> {
    return UserMutationService.deleteUser(username);
  }

  static async changePassword(username: string, newPassword: string): Promise<boolean> {
    try {
      await PasswordService.updateUserPassword(username, newPassword);
      return true;
    } catch (error) {
      console.error('Error changing password in UserService:', error);
      return false;
    }
  }
}
