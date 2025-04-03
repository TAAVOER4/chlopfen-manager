
import { supabase } from '@/integrations/supabase/client';

export class BaseSupabaseService {
  protected static supabase = supabase;
}
