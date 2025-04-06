
import { GroupService as NewGroupService } from './group';

// Re-export the new service to maintain backward compatibility
export class GroupService extends NewGroupService {}
