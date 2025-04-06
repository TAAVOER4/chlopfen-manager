
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
      
      // Create an array of updates for the database
      const updates = participantUpdates.map(update => ({
        id: update.id,
        display_order: update.displayOrder
      }));
      
      const { error } = await this.supabase
        .from('participants')
        .upsert(updates, { onConflict: 'id' });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error bulk updating participant display order:', error);
      throw error;
    }
  }
}
