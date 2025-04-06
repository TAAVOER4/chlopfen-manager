
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseParticipantService extends BaseService {
  // Explicitly initialize the supabase client to ensure it's available
  protected static supabase = supabase;
}
