
import { supabase } from '@/integrations/supabase/client';

export class BaseService {
  protected static supabase = supabase;
  
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }

  // Helper to check if supabase client is initialized
  protected static checkSupabaseClient() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    return this.supabase;
  }
}
