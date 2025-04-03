
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';
import { DatabaseUser } from './DatabaseUserTypes';

/**
 * Maps a database user to the application user model
 */
export function mapDatabaseUserToUser(user: DatabaseUser): User {
  return {
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
}
