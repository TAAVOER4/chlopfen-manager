import { BaseService } from '../BaseService';

export class BaseGroupService extends BaseService {
  protected static handleError(error: unknown, context: string) {
    console.error(`Error ${context}:`, error);
    throw error;
  }
}
