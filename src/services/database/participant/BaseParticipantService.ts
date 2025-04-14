
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseParticipantService extends BaseService {
  protected static supabase = supabase;
}
