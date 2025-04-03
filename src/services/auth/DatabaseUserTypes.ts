
import { UserRole, CriterionKey, GroupCriterionKey } from '@/types';

export interface DatabaseUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password_hash: string;
  individual_criterion: CriterionKey | null;
  group_criterion: GroupCriterionKey | null;
  email?: string; // Optional email field that might be present
}
