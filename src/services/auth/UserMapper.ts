
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { AuthUserData } from './types/AuthTypes';

/**
 * Maps a database user to the application user model
 */
export function mapDatabaseUserToUser(userData: AuthUserData): User {
  return {
    id: userData.id, // Keep the string UUID instead of parsing to number
    name: userData.name,
    username: userData.username,
    role: userData.role as UserRole,
    passwordHash: userData.password_hash,
    assignedCriteria: {
      individual: userData.individual_criterion as CriterionKey | undefined,
      group: userData.group_criterion as GroupCriterionKey | undefined
    },
    tournamentIds: []
  };
}
