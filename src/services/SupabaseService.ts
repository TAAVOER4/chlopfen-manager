
import { UserService } from './UserService';
import { AuthService } from './AuthService';

// Export a combined service for backward compatibility
export class SupabaseService {
  // User operations
  static getAllUsers = UserService.getAllUsers;
  static createUser = UserService.createUser;
  static updateUser = UserService.updateUser;
  static deleteUser = UserService.deleteUser;
  static changePassword = UserService.changePassword;
  
  // Auth operations
  static authenticateUser = AuthService.authenticateUser;
  static initializeUsers = AuthService.initializeUsers;
}
