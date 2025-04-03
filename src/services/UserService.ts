
import { User } from '@/types';
import { UserQueryService } from './user/UserQueryService';
import { UserMutationService } from './user/UserMutationService';

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

  static async changePassword(username: string, newPassword: string): Promise<void> {
    return UserMutationService.changePassword(username, newPassword);
  }
}
