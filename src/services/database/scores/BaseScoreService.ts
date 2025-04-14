
import { BaseService } from '../BaseService';

export class BaseScoreService extends BaseService {
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }
}
