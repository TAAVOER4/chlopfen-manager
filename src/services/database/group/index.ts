
import { BaseGroupService } from './BaseGroupService';
import { GroupQueryService } from './GroupQueryService';
import { GroupMutationService } from './GroupMutationService';
import { GroupOrderService } from './GroupOrderService';

// Re-export for ease of use
export { BaseGroupService, GroupQueryService, GroupMutationService, GroupOrderService };

// Main service that combines all functionality
export class GroupService {
  // Query methods
  static getAllGroups = GroupQueryService.getAllGroups;
  
  // Mutation methods
  static createGroup = GroupMutationService.createGroup;
  static updateGroup = GroupMutationService.updateGroup;
  static deleteGroup = GroupMutationService.deleteGroup;
  
  // Order methods
  static updateGroupDisplayOrder = GroupOrderService.updateGroupDisplayOrder;
  static bulkUpdateGroupDisplayOrder = GroupOrderService.bulkUpdateGroupDisplayOrder;
}
