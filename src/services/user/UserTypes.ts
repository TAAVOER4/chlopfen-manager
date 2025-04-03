
import { User, UserRole, CriterionKey, GroupCriterionKey } from '@/types';

export interface SupabaseUserData {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  individual_criterion: string | null;
  group_criterion: string | null;
}

