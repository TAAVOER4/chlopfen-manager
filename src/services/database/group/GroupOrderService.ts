
import { BaseGroupService } from './BaseGroupService';

export class GroupOrderService extends BaseGroupService {
  static async updateGroupDisplayOrder(groupId: number, displayOrder: number) {
    try {
      console.log(`Updating display order for group ${groupId} to ${displayOrder}`);
      
      const { error } = await this.supabase
        .from('groups')
        .update({ display_order: displayOrder })
        .eq('id', groupId);
        
      if (error) {
        console.error("Error updating group display order:", error);
        throw error;
      }
      
      console.log("Group display order updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating group display order:', error);
      throw error;
    }
  }

  static async bulkUpdateGroupDisplayOrder(groupUpdates: { id: number, displayOrder: number }[]) {
    try {
      if (groupUpdates.length === 0) return true;
      
      console.log("Bulk updating group display orders:", groupUpdates);
      
      // First, fetch the current data for these groups to ensure we have all required fields
      const groupIds = groupUpdates.map(update => update.id);
      const { data: existingGroups, error: fetchError } = await this.supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
        
      if (fetchError) {
        console.error("Error fetching existing groups for update:", fetchError);
        throw fetchError;
      }
      
      if (!existingGroups || existingGroups.length === 0) {
        console.error("No existing groups found for update");
        throw new Error("No existing groups found for update");
      }
      
      // Create an array of updates that preserves all existing data and only updates the display_order
      const updates = existingGroups.map(group => {
        const update = groupUpdates.find(u => u.id === group.id);
        return {
          ...group, // Keep all existing data
          display_order: update ? update.displayOrder : group.display_order
        };
      });
      
      // Perform the upsert
      const { error } = await this.supabase
        .from('groups')
        .upsert(updates);
        
      if (error) {
        console.error("Error bulk updating group display orders:", error);
        throw error;
      }
      
      console.log("Bulk update of group display orders completed successfully");
      return true;
    } catch (error) {
      console.error('Error bulk updating group display orders:', error);
      throw error;
    }
  }
}
