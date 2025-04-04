
import { UserQueryService } from './UserQueryService';
import { UserMutationService } from './UserMutationService';
import { UserInitializationService } from './UserInitializationService';
import { User } from '@/types';

/**
 * UserService combines all user-related services for backward compatibility
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
    return UserMutationService.changePassword(username, newPassword);
  }
  
  // Initialization operations
  static async initializeDefaultAdmin(): Promise<void> {
    return UserInitializationService.initializeDefaultAdmin();
  }
}
