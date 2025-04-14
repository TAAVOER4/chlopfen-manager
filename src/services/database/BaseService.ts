
import { supabase } from '@/integrations/supabase/client';

export class BaseService {
  protected static supabase = supabase;
  
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }
}
