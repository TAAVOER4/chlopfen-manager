
import { BaseSupabaseService } from './BaseSupabaseService';
import { Tournament } from '@/types';

export class MigrationService extends BaseSupabaseService {
  // Migrate mock data to database tables
  static async migrateData(): Promise<void> {
    try {
      // First check if we've already run the migration
      const migrationKey = 'data_migration_performed';
      if (localStorage.getItem(migrationKey) === 'true') {
        console.log('Migration already performed, skipping...');
        return;
      }
      
      console.log('Starting data migration...');
      await this.migrateTournaments();
      await this.migrateUsers();
      
      // Mark migration as complete
      localStorage.setItem(migrationKey, 'true');
      console.log('Data migration completed successfully!');
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  }
  
  // Migrate tournaments data
  private static async migrateTournaments(): Promise<void> {
    try {
      console.log('Checking for existing tournaments...');
      const { data: existingTournaments, error } = await this.supabase
        .from('tournaments')
        .select('count');
        
      if (error) {
        console.error('Error checking existing tournaments:', error);
        return;
      }
      
      // Only add default tournaments if none exist
      if (existingTournaments.length === 0 || existingTournaments[0].count === 0) {
        console.log('No existing tournaments found, adding defaults...');
        
        const defaultTournaments = [
          {
            name: 'Schweizermeisterschaft Chlausjagen 2023',
            date: '2023-12-15',
            location: 'Bern, Kongresszentrum',
            year: 2023,
            is_active: false
          },
          {
            name: 'Schweizermeisterschaft Chlausjagen 2024',
            date: '2024-12-14',
            location: 'Zürich, Messehalle',
            year: 2024,
            is_active: true
          }
        ];
        
        const { error: insertError } = await this.supabase
          .from('tournaments')
          .insert(defaultTournaments);
          
        if (insertError) {
          console.error('Error adding default tournaments:', insertError);
        } else {
          console.log('Default tournaments added successfully!');
        }
      } else {
        console.log('Existing tournaments found, skipping default tournament creation.');
      }
    } catch (error) {
      console.error('Error migrating tournaments:', error);
    }
  }
  
  // Migrate users data
  private static async migrateUsers(): Promise<void> {
    try {
      console.log('Checking for existing users...');
      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('count');
        
      if (error) {
        console.error('Error checking existing users:', error);
        return;
      }
      
      // Only add default users if none exist
      if (existingUsers.length === 0 || existingUsers[0].count === 0) {
        console.log('No existing users found, adding defaults will be handled by AuthService.initializeUsers()...');
      } else {
        console.log('Existing users found, skipping default user creation.');
      }
    } catch (error) {
      console.error('Error migrating users:', error);
    }
  }
  
  // Run initial setup for the application
  static async runInitialSetup(): Promise<void> {
    try {
      await this.migrateData();
    } catch (error) {
      console.error('Error in initial setup:', error);
    }
  }
}
