
import { BaseService } from '../BaseService';
import { Participant } from '@/types';

export class BaseParticipantService extends BaseService {
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }
}
