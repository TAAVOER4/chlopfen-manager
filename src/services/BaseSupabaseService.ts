
import { supabase } from '@/integrations/supabase/client';

/**
 * Base class for all Supabase services
 */
export class BaseSupabaseService {
  // Protected access to the Supabase client instance
  protected static get supabase() {
    return supabase;
  }

  // Public method to get the Supabase client for use in hooks and components
  public static getClient() {
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
