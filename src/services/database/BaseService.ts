
import { supabase } from '@/lib/supabase';

/**
 * Base class for database services with common functionality
 */
export class BaseService {
  // Protected access to the Supabase client instance
  protected static get supabase() {
    return supabase;
  }
}
