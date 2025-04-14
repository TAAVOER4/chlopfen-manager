
import { BaseService } from '../BaseService';
import { Group } from '@/types';

export class BaseGroupService extends BaseService {
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }
}
