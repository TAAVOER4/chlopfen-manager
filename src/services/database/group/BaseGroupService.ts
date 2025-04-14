
import { supabase } from '@/lib/supabase';

export class BaseGroupService {
  protected static supabase = supabase;
}
