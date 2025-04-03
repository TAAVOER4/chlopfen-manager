
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
}
