
import { supabase } from '@/integrations/supabase/client';

/**
 * Base class for all Supabase services
 */
export class BaseSupabaseService {
  // Get the Supabase client instance
  protected static get supabase() {
    return supabase;
  }

  // Get the current authenticated user ID from Supabase
  protected static async getCurrentUserId(): Promise<string | null> {
    try {
      const { data } = await this.supabase.auth.getSession();
      return data.session?.user.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }
}
