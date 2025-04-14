import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/utils/authUtils';
import { User } from '@/types';

export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    // First, find the user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
      
    if (userError || !user) {
      console.error('User not found:', userError);
      return null;
    }
    
    // Check if the password matches
    if (!verifyPassword(password, user.password_hash)) {
      console.error('Invalid password');
      return null;
    }
    
    // Get tournament assignments for the user
    const { data: userTournaments, error: tournamentsError } = await supabase
      .from('user_tournaments')
      .select('tournament_id')
      .eq('user_id', user.id);
      
    if (tournamentsError) {
      console.error('Error getting tournament assignments:', tournamentsError);
    }
    
    const tournamentIds = userTournaments ? userTournaments.map(t => t.tournament_id) : [];
    
    // Return the user with the string ID
    return {
      id: user.id, // Already a string in UUID format
      name: user.name,
      username: user.username,
      role: user.role,
      passwordHash: user.password_hash,
      assignedCriteria: {
        individual: user.individual_criterion,
        group: user.group_criterion
      },
      tournamentIds
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};
