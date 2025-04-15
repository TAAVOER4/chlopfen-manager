
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixfgmtscvwixkojsmfrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmdtdHNjdndpeGtvanNtZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU5NzYsImV4cCI6MjA1OTI2MTk3Nn0.Mz9TMFv3G3FEuNfk6eJ8wfaIyKUQRZpvPA2UGyvHR64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute raw SQL commands
export const executeRawSql = async (sqlCommand: string): Promise<boolean> => {
  try {
    console.log('Executing SQL command:', sqlCommand);
    
    // First try using the execute_sql RPC function
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_command: sqlCommand 
    });
    
    if (error) {
      console.error('Error executing raw SQL:', error);
      
      // If the RPC function fails, try direct SQL update if it's an UPDATE statement
      if (sqlCommand.trim().toUpperCase().startsWith('UPDATE')) {
        // Extract table name and conditions from the SQL command (simplified parsing)
        const matches = sqlCommand.match(/UPDATE\s+([^\s]+)\s+SET\s+([^WHERE]+)\s+WHERE\s+(.+)/i);
        if (matches && matches.length >= 4) {
          const tableName = matches[1].trim();
          const setClause = matches[2].trim();
          const whereClause = matches[3].trim();
          
          console.log(`Attempting direct update on ${tableName} where ${whereClause}`);
          
          // Create an object for the SET clause - this is a simplified approach
          const setValues: Record<string, any> = {};
          setClause.split(',').forEach(clause => {
            const [key, value] = clause.split('=').map(part => part.trim());
            // Remove any quotes from the key
            const cleanKey = key.replace(/["'`]/g, '');
            
            // For values, handle special cases like NOW()
            if (value.toUpperCase() === 'NOW()') {
              setValues[cleanKey] = new Date().toISOString();
            } else if (value === 'NULL' || value === 'null') {
              setValues[cleanKey] = null;
            } else {
              // Remove any quotes from string literals
              setValues[cleanKey] = value.replace(/^['"](.*)['"]$/, '$1');
            }
          });
          
          console.log('Set values for direct update:', setValues);
          
          // Parse the WHERE conditions - this is a simplified approach for common cases
          const conditions: Record<string, any> = {};
          whereClause.split('AND').forEach(condition => {
            const parts = condition.trim().split('=').map(part => part.trim());
            if (parts.length === 2) {
              const key = parts[0].trim();
              const value = parts[1].replace(/^['"](.*)['"]$/, '$1');
              conditions[key] = value;
            }
          });
          
          console.log('Conditions for direct update:', conditions);
          
          // Execute the direct update - the conditions will be applied using .eq() for each key-value pair
          const updateQuery = supabase.from(tableName.replace(/^public\./, ''));
          
          // Apply each condition - fix the TypeScript error by using proper type casting
          let queryWithConditions = updateQuery;
          
          Object.entries(conditions).forEach(([key, value]) => {
            // Cast the query builder to any to avoid TypeScript errors with method chaining
            queryWithConditions = (queryWithConditions as any).eq(key, value);
          });
          
          // Execute the update
          const { error: updateError } = await queryWithConditions.update(setValues);
          
          if (updateError) {
            console.error('Error with direct update:', updateError);
            return false;
          }
          
          return true;
        }
      }
      
      return false;
    }
    
    console.log('SQL execution result:', data);
    return true;
  } catch (error) {
    console.error('Exception in executeRawSql:', error);
    return false;
  }
};

// Archive all scores for a specific group and tournament with explicit modified_by
export const archiveGroupScores = async (groupId: number, tournamentId: number, modifiedBy: string): Promise<boolean> => {
  try {
    console.log(`Archiving scores for group ${groupId}, tournament ${tournamentId}, modified by ${modifiedBy}`);
    
    // First try using the direct SQL command which gives us the most control
    const sqlCommand = `
      UPDATE public.group_scores 
      SET record_type = 'H', 
          modified_at = NOW(),
          modified_by = '${modifiedBy}'
      WHERE group_id = ${groupId} 
      AND tournament_id = ${tournamentId}
      AND record_type = 'C'
    `;
    
    const sqlSuccess = await executeRawSql(sqlCommand);
    
    if (sqlSuccess) {
      console.log('Successfully archived scores using SQL command');
      return true;
    }
    
    console.warn('SQL command failed, trying RPC function');
    
    // Try using the RPC function as fallback
    const { data, error } = await supabase.rpc('archive_group_scores', {
      p_group_id: groupId,
      p_tournament_id: tournamentId
    });
    
    if (error) {
      console.error('Error using archive_group_scores function:', error);
      
      // Last resort - direct update with the Supabase client
      console.log('Attempting direct Supabase client update');
      
      // Fix the TypeScript error by properly typing the query builder and chaining
      const query = supabase.from('group_scores');
      
      // Use type assertion to allow chaining eq() methods
      const { error: updateError } = await (query as any)
        .update({ 
          record_type: 'H', 
          modified_at: new Date().toISOString(),
          modified_by: modifiedBy
        })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (updateError) {
        console.error('All archive attempts failed:', updateError);
        return false;
      }
    }
    
    // Verify the operation was successful
    const { data: checkData, error: checkError } = await (supabase
      .from('group_scores')
      .select('id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C') as any);
      
    if (checkError) {
      console.error('Error verifying archive operation:', checkError);
      return false;
    }
    
    if (checkData && checkData.length > 0) {
      console.warn(`Archive operation partially failed: ${checkData.length} records still active`);
      return false;
    }
    
    console.log('Archive operation verified successful');
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
