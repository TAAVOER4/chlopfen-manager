
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseGroupService extends BaseService {
  protected static supabase = supabase;
}
