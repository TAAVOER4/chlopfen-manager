
import { BaseGroupService } from './BaseGroupService';
import { Group } from '@/types';

export class GroupOrderService extends BaseGroupService {
  static async updateGroupDisplayOrder(id: number, displayOrder: number) {
    try {
      const { error } = await this.supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating group display order:', error);
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(groups: Pick<Group, 'id' | 'displayOrder'>[]) {
    try {
      // Create promises for all updates
      const updatePromises = groups.map(group => 
        this.supabase
          .from('groups')
          .update({ display_order: group.displayOrder })
          .eq('id', group.id)
      );
      
      // Execute all updates in parallel
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} errors occurred during bulk update`);
      }
      
      return true;
    } catch (error) {
      console.error('Error bulk updating group display orders:', error);
      throw error;
    }
  }
}
