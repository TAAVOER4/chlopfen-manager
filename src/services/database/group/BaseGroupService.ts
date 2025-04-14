
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseGroupService extends BaseService {
  protected static supabase = supabase;
  
  // Add the missing method
  protected static checkSupabaseClient() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized in BaseGroupService');
      throw new Error('Supabase client is not initialized');
    }
    return this.supabase;
  }
}
