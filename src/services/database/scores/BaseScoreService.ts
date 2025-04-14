
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseScoreService extends BaseService {
  protected static supabase = supabase;
  
  protected static handleError(error: unknown, context: string): never {
    console.error(`Error in ${context}:`, error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ein unerwarteter Fehler ist aufgetreten';
      
    throw new Error(`${context}: ${errorMessage}`);
  }
  
  protected static checkSupabaseClient() {
    if (!this.supabase) {
      console.error('Supabase client is not initialized in BaseScoreService');
      throw new Error('Supabase client is not initialized');
    }
    return this.supabase;
  }
}
