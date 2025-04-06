import { BaseService } from './BaseService';
import { Participant } from '@/types';
import { supabase } from '@/lib/supabase';

export class ParticipantService extends BaseService {
  static async getAllParticipants() {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) throw error;
      
      if (!data) return [];
      
      // Map the database column names to the frontend property names
      const transformedData = data.map(participant => ({
        id: participant.id,
        firstName: participant.first_name,
        lastName: participant.last_name,
        location: participant.location,
        birthYear: participant.birth_year,
        category: participant.category,
        isGroupOnly: participant.is_group_only || false,
        tournamentId: participant.tournament_id,
        displayOrder: participant.display_order,
        groupIds: [] // Will be populated later
      }));
      
      // Fetch group associations for all participants
      const { data: groupParticipants, error: groupError } = await supabase
        .from('group_participants')
        .select('*');
        
      if (!groupError && groupParticipants) {
        // Populate groupIds for each participant
        transformedData.forEach(participant => {
          participant.groupIds = groupParticipants
            .filter(gp => gp.participant_id === participant.id)
            .map(gp => gp.group_id);
        });
      }
      
      return transformedData as Participant[];
    } catch (error) {
      console.error('Error loading participants:', error);
      return [];
    }
  }

  static async createParticipant(participant: Omit<Participant, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{
          first_name: participant.firstName,
          last_name: participant.lastName,
          location: participant.location,
          birth_year: participant.birthYear,
          category: participant.category,
          is_group_only: participant.isGroupOnly || false,
          tournament_id: participant.tournamentId
        }])
        .select()
        .single();
        
      if (error) throw error;
      
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
        groupIds: []
      };
      
      return newParticipant;
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  static async updateParticipant(participant: Participant) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({
          first_name: participant.firstName,
          last_name: participant.lastName,
          location: participant.location,
          birth_year: participant.birthYear,
          category: participant.category,
          is_group_only: participant.isGroupOnly || false,
          tournament_id: participant.tournamentId
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
        groupIds: participant.groupIds
      } as Participant;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  static async deleteParticipant(id: number) {
    try {
      const { error } = await supabase
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

  static async updateParticipantTournament(participantId: number, tournamentId: number | null) {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ tournament_id: tournamentId })
        .eq('id', participantId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating participant tournament:', error);
      throw error;
    }
  }

  static async bulkUpdateParticipantTournaments(participantIds: number[], tournamentId: number | null) {
    try {
      if (participantIds.length === 0) return true;
      
      const { error } = await supabase
        .from('participants')
        .update({ tournament_id: tournamentId })
        .in('id', participantIds);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error bulk updating participant tournaments:', error);
      throw error;
    }
  }

  static async updateParticipantDisplayOrder(participantId: number, displayOrder: number) {
    try {
      const { error } = await supabase
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
      
      const { error } = await supabase
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
