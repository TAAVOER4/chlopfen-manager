
import { BaseSupabaseService } from '../BaseSupabaseService';
import { hashPassword } from '@/utils/authUtils';
import { UserRole } from '@/types';
import { mockJudges } from '@/data/mockJudges';

export class UserInitializationService extends BaseSupabaseService {
  static async initializeDefaultAdmin(): Promise<void> {
    try {
      const defaultAdmin = {
        id: '00000000-0000-4000-a000-000000000001',
        name: 'Administrator',
        username: 'admin',
        password_hash: hashPassword('admin'),
        role: 'admin' as UserRole,
        individual_criterion: null,
        group_criterion: null
      };
      
      const { error } = await this.supabase
        .from('users')
        .insert([defaultAdmin]);
        
      if (error) {
        console.error('Error creating default admin:', error);
        return;
      }
      
      console.log('Default admin user created successfully');
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
  
  static async initializeMockJudges(): Promise<void> {
    try {
      // Check if we already have judges
      const { data: existingJudges, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .limit(3);
        
      if (checkError) {
        console.error('Error checking for judges:', checkError);
        return;
      }
      
      // If we already have at least 3 users, don't initialize again
      if (existingJudges && existingJudges.length >= 3) {
        console.log('Judges already exist, skipping initialization');
        return;
      }
      
      // Convert mock judges to the format expected by Supabase
      const supabaseJudges = mockJudges.map(judge => ({
        id: judge.id,
        name: judge.name,
        username: judge.username, 
        password_hash: judge.passwordHash,
        role: judge.role,
        individual_criterion: judge.assignedCriteria?.individual || null,
        group_criterion: judge.assignedCriteria?.group || null
      }));
      
      // Insert all mock judges in one go
      const { error } = await this.supabase
        .from('users')
        .insert(supabaseJudges);
        
      if (error) {
        console.error('Error initializing mock judges:', error);
        return;
      }
      
      console.log('Mock judges initialized successfully');
      
      // Now initialize tournament assignments
      for (const judge of mockJudges) {
        if (judge.tournamentIds && judge.tournamentIds.length > 0) {
          const tournamentsData = judge.tournamentIds.map(tournamentId => ({
            user_id: judge.id,
            tournament_id: tournamentId
          }));
          
          const { error: tournamentsError } = await this.supabase
            .from('user_tournaments')
            .insert(tournamentsData);
            
          if (tournamentsError) {
            console.error(`Error initializing tournaments for ${judge.name}:`, tournamentsError);
          }
        }
      }
      
      console.log('Tournament assignments initialized successfully');
    } catch (error) {
      console.error('Error initializing mock judges:', error);
    }
  }
}
