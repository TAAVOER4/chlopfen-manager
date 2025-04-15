import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixfgmtscvwixkojsmfrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmdtdHNjdndpeGtvanNtZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU5NzYsImV4cCI6MjA1OTI2MTk3Nn0.Mz9TMFv3G3FEuNfk6eJ8wfaIyKUQRZpvPA2UGyvHR64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute raw SQL commands
export const executeRawSql = async (sqlCommand: string): Promise<boolean> => {
  try {
    console.log('DIRECT SQL EXECUTION - Command:', sqlCommand);
    
    // First try using the execute_sql RPC function
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_command: sqlCommand 
    });
    
    if (error) {
      console.error('ERROR in executeRawSql using RPC:', error);
      
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
          const { error: updateError, data: updateData } = await queryWithConditions.update(setValues);
          
          if (updateError) {
            console.error('Error with direct update:', updateError);
            return false;
          }
          
          console.log('Direct update success:', updateData);
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
    console.log(`🔄 ARCHIVE OPERATION - Starting for group ${groupId}, tournament ${tournamentId}`);
    
    // First, try a direct update via the Supabase client - this is the most reliable approach
    console.log("🔍 ARCHIVE - Method 1: Using direct Supabase update");
    
    const { error: directError, data: directData } = await supabase
      .from('group_scores')
      .update({ 
        record_type: 'H', 
        modified_at: new Date().toISOString(),
        modified_by: modifiedBy
      })
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C')
      .select(); // Add .select() to ensure we get the updated data
    
    if (directError) {
      console.error('❌ Direct update failed:', directError);
    } else {
      // Fix the TypeScript error by checking if directData is an array
      console.log('✅ Direct update appears successful, affected records:', Array.isArray(directData) ? directData.length : 0);
      // Add a delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Double-check if any records still have record_type = 'C'
    const { data: remainingRecords, error: checkError } = await supabase
      .from('group_scores')
      .select('id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
    
    if (checkError) {
      console.error('❌ Error checking remaining records:', checkError);
    } else if (remainingRecords && remainingRecords.length > 0) {
      console.warn(`⚠️ Some records (${remainingRecords.length}) still have record_type='C'`);
      
      // Try a different approach - use raw SQL via the RPC function
      console.log("🔍 ARCHIVE - Method 2: Using execute_sql RPC");
      
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
      
      if (!sqlSuccess) {
        console.error('❌ SQL RPC method failed');
        
        // Final attempt - update each record individually
        console.log("🔍 ARCHIVE - Method 3: Updating records individually");
        
        const { data: individualRecords, error: fetchError } = await supabase
          .from('group_scores')
          .select('id')
          .eq('group_id', groupId)
          .eq('tournament_id', tournamentId)
          .eq('record_type', 'C');
          
        if (fetchError) {
          console.error('❌ Error fetching records for individual update:', fetchError);
        } else if (individualRecords && individualRecords.length > 0) {
          console.log(`Attempting to update ${individualRecords.length} records individually`);
          
          for (const record of individualRecords) {
            const { error: indivError } = await supabase
              .from('group_scores')
              .update({ 
                record_type: 'H', 
                modified_at: new Date().toISOString(),
                modified_by: modifiedBy
              })
              .eq('id', record.id);
              
            if (indivError) {
              console.error(`❌ Failed to update record ${record.id}:`, indivError);
            } else {
              console.log(`✅ Successfully updated record ${record.id}`);
            }
            
            // Add a small delay between operations
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else {
        console.log('✅ SQL RPC method successful');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } else {
      console.log('✅ All records successfully archived');
    }
    
    // Final verification
    const { data: finalCheck, error: finalError } = await supabase
      .from('group_scores')
      .select('id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (finalError) {
      console.error('❌ Error during final verification:', finalError);
      return false;
    }
    
    if (finalCheck && finalCheck.length > 0) {
      console.warn(`⚠️ Archive operation partially failed: ${finalCheck.length} records still active`);
      console.log('IDs of records still active:', finalCheck.map(r => r.id).join(', '));
      return false;
    }
    
    console.log('✅ ARCHIVE OPERATION - Successfully completed');
    return true;
  } catch (error) {
    console.error('❌ Exception in archiveGroupScores:', error);
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
