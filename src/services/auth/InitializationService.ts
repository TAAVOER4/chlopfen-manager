
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/authUtils';
import { UserInitializationService } from '../user/UserInitializationService';

export const initializeAuth = async (): Promise<void> => {
  try {
    console.log('Initializing auth...');
    
    // Check if we already have users in the system
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for users:', checkError);
      return;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Users already exist, skipping initialization');
      return;
    }
    
    console.log('No users found, initializing...');
    
    // Initialize default admin
    await UserInitializationService.initializeDefaultAdmin();
    
    // Initialize mock judges
    await UserInitializationService.initializeMockJudges();
    
    console.log('Auth initialization complete');
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};
