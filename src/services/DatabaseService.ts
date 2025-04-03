
import { supabase } from '@/lib/supabase';
import { Participant, Group, IndividualScore, GroupScore } from '@/types';

export class DatabaseService {
  // Participants
  static async getAllParticipants() {
    const { data, error } = await supabase
      .from('participants')
      .select('*');
      
    if (error) throw error;
    return data as Participant[];
  }

  static async createParticipant(participant: Omit<Participant, 'id'>) {
    const { data, error } = await supabase
      .from('participants')
      .insert([participant])
      .select()
      .single();
      
    if (error) throw error;
    return data as Participant;
  }

  // Groups
  static async getAllGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('*');
      
    if (error) throw error;
    return data as Group[];
  }

  static async createGroup(group: Omit<Group, 'id'>) {
    const { data, error } = await supabase
      .from('groups')
      .insert([group])
      .select()
      .single();
      
    if (error) throw error;
    return data as Group;
  }

  // Individual Scores
  static async getIndividualScores() {
    const { data, error } = await supabase
      .from('individual_scores')
      .select('*');
      
    if (error) throw error;
    return data as IndividualScore[];
  }

  static async createIndividualScore(score: IndividualScore) {
    const { data, error } = await supabase
      .from('individual_scores')
      .insert([score])
      .select()
      .single();
      
    if (error) throw error;
    return data as IndividualScore;
  }

  // Group Scores
  static async getGroupScores() {
    const { data, error } = await supabase
      .from('group_scores')
      .select('*');
      
    if (error) throw error;
    return data as GroupScore[];
  }

  static async createGroupScore(score: GroupScore) {
    const { data, error } = await supabase
      .from('group_scores')
      .insert([score])
      .select()
      .single();
      
    if (error) throw error;
    return data as GroupScore;
  }

  // Statistics Methods
  static async getParticipantStatistics() {
    const { data, error } = await supabase
      .from('participants')
      .select('*');
      
    if (error) throw error;
    
    const participants = data as Participant[];
    
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
  }
  
  static async getGroupStatistics() {
    const { data, error } = await supabase
      .from('groups')
      .select('*');
      
    if (error) throw error;
    
    const groups = data as Group[];
    
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
  }
  
  static async getScoreStatistics() {
    const { data: individualData, error: individualError } = await supabase
      .from('individual_scores')
      .select('*');
      
    if (individualError) throw individualError;
    
    const { data: groupData, error: groupError } = await supabase
      .from('group_scores')
      .select('*');
      
    if (groupError) throw groupError;
    
    const individualScores = individualData as IndividualScore[];
    const groupScores = groupData as GroupScore[];
    
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
  }
}
