
import { supabase } from '@/integrations/supabase/client';

/**
 * Base class for all database services
 */
export class BaseService {
  // Protected access to the Supabase client for all derived classes
  protected static supabase = supabase;
}
