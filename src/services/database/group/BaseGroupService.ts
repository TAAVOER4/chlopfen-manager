
import { supabase } from '@/integrations/supabase/client';

export class BaseGroupService {
  // Make supabase client available to all derived classes
  protected static supabase = supabase;
}
