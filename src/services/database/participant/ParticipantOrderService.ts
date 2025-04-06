
import { BaseParticipantService } from './BaseParticipantService';

export class ParticipantOrderService extends BaseParticipantService {
  static async updateParticipantDisplayOrder(participantId: number, displayOrder: number) {
    try {
      const { error } = await this.supabase
        .from('participants')
        .update({ display_order: displayOrder })
        .eq('id', participantId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating participant display order:', error);
      throw error;
    }
  }

  static async bulkUpdateParticipantDisplayOrder(participantUpdates: { id: number, displayOrder: number }[]) {
    try {
      if (participantUpdates.length === 0) return true;
      
      // We need to approach this differently since we can't just update with partial data
      // We'll update one by one instead
      const updatePromises = participantUpdates.map(update => 
        this.supabase
          .from('participants')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} errors occurred during bulk update`);
      }
      
      return true;
    } catch (error) {
      console.error('Error bulk updating participant display order:', error);
      throw error;
    }
  }
}
