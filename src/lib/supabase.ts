
import { createClient } from '@supabase/supabase-js';

// Use the direct values for the Supabase URL and API key
const supabaseUrl = 'https://ixfgmtscvwixkojsmfrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmdtdHNjdndpeGtvanNtZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU5NzYsImV4cCI6MjA1OTI2MTk3Nn0.Mz9TMFv3G3FEuNfk6eJ8wfaIyKUQRZpvPA2UGyvHR64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute raw SQL commands
export const executeRawSql = async (sqlCommand: string): Promise<boolean> => {
  try {
    console.log('Executing SQL command:', sqlCommand);
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_command: sqlCommand 
    });
    
    if (error) {
      console.error('Error executing raw SQL:', error);
      return false;
    }
    
    console.log('SQL execution result:', data);
    return true;
  } catch (error) {
    console.error('Exception in executeRawSql:', error);
    return false;
  }
};

// Archive all scores for a specific group and tournament
export const archiveGroupScores = async (groupId: number, tournamentId: number): Promise<boolean> => {
  try {
    console.log(`Archiving scores for group ${groupId}, tournament ${tournamentId}`);
    
    // Try using the dedicated function
    const { data, error } = await supabase.rpc('archive_group_scores', {
      p_group_id: groupId,
      p_tournament_id: tournamentId
    });
    
    if (error) {
      console.error('Error using archive_group_scores function:', error);
      
      // Fallback to direct SQL execution
      return await executeRawSql(`
        UPDATE public.group_scores 
        SET record_type = 'H', 
            modified_at = NOW() 
        WHERE group_id = ${groupId} 
        AND tournament_id = ${tournamentId}
        AND record_type = 'C'
      `);
    }
    
    return true;
  } catch (error) {
    console.error('Exception in archiveGroupScores:', error);
    return false;
  }
};

// Export a function to check if the Supabase client is correctly configured
export const checkSupabaseConnection = async () => {
  try {
    console.log("Checking Supabase connection...");
    const { data, error } = await supabase.from('participants').select('count');
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};
