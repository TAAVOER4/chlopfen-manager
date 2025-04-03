
import { User, UserRole } from '@/types';
import { SupabaseUserData } from './UserTypes';

/**
 * Maps Supabase user data to application User model
 */
export class UserMapper {
  /**
   * Convert Supabase user data to our User model
   */
  static toUserModel(userData: SupabaseUserData): User {
    return {
      id: parseInt(userData.id.toString().replace(/-/g, '').substring(0, 8), 16) % 1000,
      name: userData.name,
      username: userData.username,
      role: userData.role as UserRole,
      passwordHash: userData.password_hash,
      assignedCriteria: {
        individual: userData.individual_criterion as any,
        group: userData.group_criterion as any
      },
      tournamentIds: []
    };
  }

  /**
   * Convert our User model to Supabase format
   */
  static toSupabaseFormat(user: Omit<User, 'id'> | User) {
    return {
      name: user.name,
      username: user.username,
      password_hash: user.passwordHash,
      role: user.role,
      individual_criterion: user.assignedCriteria?.individual,
      group_criterion: user.assignedCriteria?.group
    };
  }
}
