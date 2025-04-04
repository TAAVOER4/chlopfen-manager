
import { supabase } from '@/lib/supabase';
import { Participant, Group, IndividualScore, GroupScore } from '@/types';

export class DatabaseService {
  // Participants
  static async getAllParticipants() {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*');
        
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
  }

  static async updateParticipant(participant: Participant) {
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
  }

  static async deleteParticipant(id: number) {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  }

  // Groups
  static async getAllGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*');
        
      if (error) throw error;
      
      if (!data) return [];
      
      // Create initial groups without participants
      const groups = data.map(group => ({
        id: group.id,
        name: group.name,
        category: group.category,
        size: group.size,
        tournamentId: group.tournament_id,
        participantIds: [] as number[]
      }));
      
      // Fetch group-participant associations
      const { data: groupParticipants, error: groupError } = await supabase
        .from('group_participants')
        .select('*');
        
      if (!groupError && groupParticipants) {
        // Add participant IDs to each group
        groups.forEach(group => {
          group.participantIds = groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id);
        });
      }
      
      return groups as Group[];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  static async createGroup(group: Omit<Group, 'id'>) {
    try {
      // First create the group
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newGroupId = data.id;
      
      // Now add participants to the group
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: newGroupId,
          participant_id: participantId
        }));
        
        const { error: participantError } = await supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (participantError) throw participantError;
      }
      
      // Return the new group with participants
      return {
        id: newGroupId,
        name: data.name,
        category: data.category,
        size: data.size,
        tournamentId: data.tournament_id,
        participantIds: group.participantIds
      } as Group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async updateGroup(group: Group) {
    try {
      // Update the group details
      const { error } = await supabase
        .from('groups')
        .update({
          name: group.name,
          category: group.category,
          size: group.size,
          tournament_id: group.tournamentId
        })
        .eq('id', group.id);
        
      if (error) throw error;
      
      // Delete all existing participant associations
      const { error: deleteError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) throw deleteError;
      
      // Create new participant associations
      if (group.participantIds.length > 0) {
        const groupParticipants = group.participantIds.map(participantId => ({
          group_id: group.id,
          participant_id: participantId
        }));
        
        const { error: insertError } = await supabase
          .from('group_participants')
          .insert(groupParticipants);
          
        if (insertError) throw insertError;
      }
      
      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(id: number) {
    // Delete group participants associations first
    const { error: deleteParticipantsError } = await supabase
      .from('group_participants')
      .delete()
      .eq('group_id', id);
      
    if (deleteParticipantsError) throw deleteParticipantsError;
    
    // Then delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  }

  // Individual Scores
  static async getIndividualScores() {
    const { data, error } = await supabase
      .from('individual_scores')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Map to the frontend model
    return data.map(score => ({
      participantId: score.participant_id,
      judgeId: score.judge_id,
      round: score.round,
      whipStrikes: score.whip_strikes,
      rhythm: score.rhythm,
      stance: score.stance,
      posture: score.posture,
      whipControl: score.whip_control,
      tournamentId: score.tournament_id
    })) as IndividualScore[];
  }

  static async createIndividualScore(score: IndividualScore) {
    const { data, error } = await supabase
      .from('individual_scores')
      .insert([{
        participant_id: score.participantId,
        judge_id: score.judgeId,
        round: score.round,
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        stance: score.stance,
        posture: score.posture,
        whip_control: score.whipControl,
        tournament_id: score.tournamentId
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      participantId: data.participant_id,
      judgeId: data.judge_id,
      round: data.round,
      whipStrikes: data.whip_strikes,
      rhythm: data.rhythm,
      stance: data.stance,
      posture: data.posture,
      whipControl: data.whip_control,
      tournamentId: data.tournament_id
    } as IndividualScore;
  }

  // Group Scores
  static async getGroupScores() {
    const { data, error } = await supabase
      .from('group_scores')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Map to the frontend model
    return data.map(score => ({
      groupId: score.group_id,
      judgeId: score.judge_id,
      whipStrikes: score.whip_strikes,
      rhythm: score.rhythm,
      tempo: score.tempo,
      time: score.time,
      tournamentId: score.tournament_id
    })) as GroupScore[];
  }

  static async createGroupScore(score: GroupScore) {
    const { data, error } = await supabase
      .from('group_scores')
      .insert([{
        group_id: score.groupId,
        judge_id: score.judgeId,
        whip_strikes: score.whipStrikes,
        rhythm: score.rhythm,
        tempo: score.tempo,
        time: score.time,
        tournament_id: score.tournamentId
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      groupId: data.group_id,
      judgeId: data.judge_id,
      whipStrikes: data.whip_strikes,
      rhythm: data.rhythm,
      tempo: data.tempo,
      time: data.time,
      tournamentId: data.tournament_id
    } as GroupScore;
  }

  // Statistics Methods
  static async getParticipantStatistics() {
    try {
      const participants = await this.getAllParticipants();
      
      // Calculate statistics
      const kidCount = participants.filter(p => p.category === 'kids').length;
      const juniorCount = participants.filter(p => p.category === 'juniors').length;
      const activeCount = participants.filter(p => p.category === 'active').length;
      
      return {
        total: participants.length,
        kidCount,
        juniorCount,
        activeCount,
        participants
      };
    } catch (error) {
      console.error('Error getting participant statistics:', error);
      return {
        total: 0,
        kidCount: 0,
        juniorCount: 0,
        activeCount: 0,
        participants: []
      };
    }
  }
  
  static async getGroupStatistics() {
    try {
      const groups = await this.getAllGroups();
      
      // Calculate statistics
      const threeSizeGroups = groups.filter(g => g.size === 'three').length;
      const fourSizeGroups = groups.filter(g => g.size === 'four').length;
      const kidsJuniorsGroups = groups.filter(g => g.category === 'kids_juniors').length;
      const activeGroups = groups.filter(g => g.category === 'active').length;
      
      return {
        total: groups.length,
        threeSizeGroups,
        fourSizeGroups,
        kidsJuniorsGroups,
        activeGroups,
        groups
      };
    } catch (error) {
      console.error('Error getting group statistics:', error);
      return {
        total: 0,
        threeSizeGroups: 0,
        fourSizeGroups: 0,
        kidsJuniorsGroups: 0,
        activeGroups: 0,
        groups: []
      };
    }
  }
  
  static async getScoreStatistics() {
    try {
      const individualScores = await this.getIndividualScores();
      const groupScores = await this.getGroupScores();
      
      // Calculate average scores if there are any scores
      let averageIndividualScore = 0;
      if (individualScores.length > 0) {
        const totalScore = individualScores.reduce((sum, score) => {
          return sum + score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
        }, 0);
        averageIndividualScore = totalScore / (individualScores.length * 5);
      }
      
      let averageGroupScore = 0;
      if (groupScores.length > 0) {
        const totalScore = groupScores.reduce((sum, score) => {
          return sum + score.whipStrikes + score.rhythm + score.tempo + (score.time ? 10 : 0);
        }, 0);
        averageGroupScore = totalScore / (groupScores.length * 4); // Including time as a criterion
      }
      
      return {
        individualScoresCount: individualScores.length,
        groupScoresCount: groupScores.length,
        totalScoresCount: individualScores.length + groupScores.length,
        averageIndividualScore,
        averageGroupScore,
        individualScores,
        groupScores
      };
    } catch (error) {
      console.error('Error getting score statistics:', error);
      return {
        individualScoresCount: 0,
        groupScoresCount: 0,
        totalScoresCount: 0,
        averageIndividualScore: 0,
        averageGroupScore: 0,
        individualScores: [],
        groupScores: []
      };
    }
  }
  
  // Update participant tournament assignments
  static async updateParticipantTournament(participantId: number, tournamentId: number | null) {
    const { error } = await supabase
      .from('participants')
      .update({ tournament_id: tournamentId })
      .eq('id', participantId);
      
    if (error) throw error;
    
    return true;
  }
  
  // Bulk update participant tournament assignments
  static async bulkUpdateParticipantTournaments(participantIds: number[], tournamentId: number | null) {
    if (participantIds.length === 0) return true;
    
    const { error } = await supabase
      .from('participants')
      .update({ tournament_id: tournamentId })
      .in('id', participantIds);
      
    if (error) throw error;
    
    return true;
  }
}
