
import { UserRole, CriterionKey, GroupCriterionKey } from '@/types';

/**
 * Interface for authentication user data from the database
 */
export interface AuthUserData {
  id: string;
  name: string;
  username: string;
  role: string;
  password_hash: string;
  individual_criterion?: string | null;
  group_criterion?: string | null;
  email?: string;
}
