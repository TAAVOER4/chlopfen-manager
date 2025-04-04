
/**
 * Raw user data structure from Supabase
 */
export interface SupabaseUserData {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  individual_criterion: string | null;
  group_criterion: string | null;
}
