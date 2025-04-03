
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { AuthUserData } from './types/AuthTypes';

/**
 * Maps a database user to the application user model
 */
export function mapDatabaseUserToUser(userData: AuthUserData): User {
  return {
    id: parseInt(userData.id.toString().substring(0, 8), 16) % 1000,
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
