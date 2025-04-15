import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixfgmtscvwixkojsmfrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmdtdHNjdndpeGtvanNtZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU5NzYsImV4cCI6MjA1OTI2MTk3Nn0.Mz9TMFv3G3FEuNfk6eJ8wfaIyKUQRZpvPA2UGyvHR64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute raw SQL commands (keeping this utility function)
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

// Archive all scores for a specific group and tournament with improved approach
export const archiveGroupScores = async (groupId: number, tournamentId: number, modifiedBy: string): Promise<boolean> => {
  try {
    console.log(`🔄 ARCHIVE OPERATION - Starting for group ${groupId}, tournament ${tournamentId}, modified by ${modifiedBy}`);
    
    // STEP 1: First attempt - use RPC function if available
    try {
      console.log('Trying to use archive_group_scores RPC function');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('archive_group_scores', {
        p_group_id: groupId,
        p_tournament_id: tournamentId
      });
      
      if (rpcError) {
        console.error('RPC function failed:', rpcError);
      } else {
        console.log('RPC function succeeded');
      }
    } catch (rpcException) {
      console.error('Exception calling RPC function:', rpcException);
    }
    
    // STEP 2: Wait a moment for DB to process
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // STEP 3: Get all current records that need to be archived
    const { data: activeRecords, error: findError } = await supabase
      .from('group_scores')
      .select('id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (findError) {
      console.error('Error finding active records:', findError);
      return false;
    }
    
    if (!activeRecords || activeRecords.length === 0) {
      console.log('No active records found, nothing to archive');
      return true;
    }
    
    console.log(`Found ${activeRecords.length} active records to archive`);
    
    // STEP 4: Second attempt - try a direct update on all records
    try {
      console.log('Attempting direct update on all records');
      const { error: bulkUpdateError } = await supabase
        .from('group_scores')
        .update({
          record_type: 'H', 
          modified_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('tournament_id', tournamentId)
        .eq('record_type', 'C');
        
      if (bulkUpdateError) {
        console.error('Bulk update failed:', bulkUpdateError);
      } else {
        console.log('Bulk update succeeded');
      }
    } catch (bulkError) {
      console.error('Exception during bulk update:', bulkError);
    }
    
    // STEP 5: Wait a moment for DB to process
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // STEP 6: Check if any records are still active
    const { data: remainingActive, error: checkError } = await supabase
      .from('group_scores')
      .select('id')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (checkError) {
      console.error('Error checking remaining active records:', checkError);
    } else if (remainingActive && remainingActive.length > 0) {
      console.log(`Still have ${remainingActive.length} active records, will archive each individually`);
      
      // STEP 7: Third attempt - archive each record individually by ID
      for (const record of remainingActive) {
        console.log(`Archiving record ID: ${record.id}`);
        
        const { error: updateError } = await supabase
          .from('group_scores')
          .update({
            record_type: 'H', 
            modified_at: new Date().toISOString()
          })
          .eq('id', record.id);
          
        if (updateError) {
          console.error(`Failed to archive record ${record.id}:`, updateError);
        } else {
          console.log(`Successfully archived record ${record.id}`);
        }
        
        // Add a small delay between operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.log('Successfully archived all records');
      return true;
    }
    
    // STEP 8: Final verification
    const { data: finalCheck, error: finalCheckError } = await supabase
      .from('group_scores')
      .select('count')
      .eq('group_id', groupId)
      .eq('tournament_id', tournamentId)
      .eq('record_type', 'C');
      
    if (finalCheckError) {
      console.error('Error during final verification:', finalCheckError);
      return false;
    }
    
    const count = finalCheck?.[0]?.count || 0;
    if (count > 0) {
      console.error(`Archive operation failed: ${count} records still active`);
      
      // STEP 9: Last resort - try SQL execution
      try {
        console.log('Attempting raw SQL execution as last resort');
        const sqlSuccess = await executeRawSql(`
          UPDATE public.group_scores 
          SET record_type = 'H', 
              modified_at = NOW()
          WHERE group_id = ${groupId} 
          AND tournament_id = ${tournamentId}
          AND record_type = 'C'
        `);
        
        if (sqlSuccess) {
          console.log('Raw SQL execution succeeded');
          return true;
        } else {
          console.error('Raw SQL execution failed');
        }
      } catch (sqlError) {
        console.error('Exception during SQL execution:', sqlError);
      }
      
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
