
import { BaseParticipantService } from './BaseParticipantService';
import { Participant } from '@/types';

export class ParticipantMutationService extends BaseParticipantService {
  static async createParticipant(participant: Omit<Participant, 'id'>) {
    try {
      console.log("Creating new participant:", participant);
      
      if (!this.supabase) {
        console.error('Supabase client is not initialized in createParticipant');
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await this.supabase
        .from('participants')
        .insert([{
          first_name: participant.firstName,
          last_name: participant.lastName,
          location: participant.location,
          birth_year: participant.birthYear,
          category: participant.category,
          is_group_only: participant.isGroupOnly || false,
          tournament_id: participant.tournamentId,
          display_order: participant.displayOrder,
          record_type: 'C'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating participant:', error);
        throw error;
      }
      
      if (!data) throw new Error('No data returned from participant creation');
      
      // Transform the data back to the frontend format
      const newParticipant: Participant = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        location: data.location,
        birthYear: data.birth_year,
        category: data.category,
        isGroupOnly: data.is_group_only || false,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order,
        groupIds: []
      };
      
      console.log("Participant created successfully:", newParticipant);
      return newParticipant;
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  static async updateParticipant(participant: Participant) {
    try {
      if (!this.supabase) {
        console.error('Supabase client is not initialized in updateParticipant');
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await this.supabase
        .from('participants')
        .update({
          first_name: participant.firstName,
          last_name: participant.lastName,
          location: participant.location,
          birth_year: participant.birthYear,
          category: participant.category,
          is_group_only: participant.isGroupOnly || false,
          tournament_id: participant.tournamentId,
          display_order: participant.displayOrder
        })
        .eq('id', participant.id)
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from participant update');
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        location: data.location,
        birthYear: data.birth_year,
        category: data.category,
        isGroupOnly: data.is_group_only || false,
        tournamentId: data.tournament_id,
        displayOrder: data.display_order,
        groupIds: participant.groupIds
      } as Participant;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  static async deleteParticipant(id: number) {
    try {
      if (!this.supabase) {
        console.error('Supabase client is not initialized in deleteParticipant');
        throw new Error('Supabase client is not initialized');
      }
      
      // First delete from group_participants
      const { error: groupParticipantsError } = await this.supabase
        .from('group_participants')
        .delete()
        .eq('participant_id', id);
        
      if (groupParticipantsError) {
        console.error('Error deleting group participants:', groupParticipantsError);
      }
      
      // Then delete the participant
      const { error } = await this.supabase
        .from('participants')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }
}
