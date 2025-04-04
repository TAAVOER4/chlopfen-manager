
import { supabase } from '@/lib/supabase';

export class BaseService {
  protected static supabase = supabase;
}
