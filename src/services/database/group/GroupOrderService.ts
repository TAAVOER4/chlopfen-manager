
import { BaseGroupService } from './BaseGroupService';
import { Group } from '@/types';

export class GroupOrderService extends BaseGroupService {
  static async updateGroupDisplayOrder(groupId: number, displayOrder: number) {
    try {
      console.log(`Updating group ${groupId} display order to ${displayOrder}`);
      
      const { error } = await this.supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', groupId);
        
      if (error) {
        console.error('Error updating group display order:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateGroupDisplayOrder method:', error);
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(groupUpdates: { id: number, displayOrder: number }[]) {
    try {
      if (groupUpdates.length === 0) return true;
      
      console.log("Bulk updating group display orders:", groupUpdates);
      
      // Update one by one to match the pattern in ParticipantOrderService
      const updatePromises = groupUpdates.map(update => 
        this.supabase
          .from('groups')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors during bulk update:", errors);
        throw new Error(`${errors.length} errors occurred during bulk update`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in bulkUpdateGroupDisplayOrder method:', error);
      throw error;
    }
  }
}
