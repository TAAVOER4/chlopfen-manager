
import { supabase } from '@/integrations/supabase/client';

export class BaseSupabaseService {
  // Make supabase public so it can be accessed from SupabaseService
  public static supabase = supabase;
}
