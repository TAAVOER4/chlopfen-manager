
import { supabase } from '@/lib/supabase';

export class BaseService {
  protected static supabase = supabase;
  
  protected static checkSupabaseClient() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized in', this.constructor.name);
      throw new Error('Supabase client is not initialized');
    }
    return this.supabase;
  }
  
  protected static handleError(error: any, action: string) {
    console.error(`Error ${action}:`, error);
    throw error;
  }
}
