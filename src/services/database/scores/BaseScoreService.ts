
import { BaseService } from '../BaseService';
import { supabase } from '@/lib/supabase';

export class BaseScoreService extends BaseService {
  /**
   * Historisiert einen bestehenden Eintrag und erstellt einen neuen aktuellen Eintrag.
   * Der bestehende Eintrag wird auf 'H' gesetzt und ein neuer mit 'C' erstellt.
   * 
   * @param tableName Name der Tabelle
   * @param id ID des zu historisierenden Eintrags
   * @param newData Neue Daten für den aktuellen Eintrag
   * @returns Der neue aktuelle Eintrag
   */
  protected static async historizeAndCreate(tableName: string, id: number, newData: any) {
    const supabase = this.checkSupabaseClient();
    
    // 1. Bestehenden Eintrag auslesen um alle Felder zu erhalten
    const { data: oldData, error: readError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
      
    if (readError || !oldData) {
      console.error(`Error reading ${tableName} entry:`, readError);
      throw new Error(`Error reading ${tableName} entry: ${readError?.message || 'Entry not found'}`);
    }
    
    // 2. Bestehenden Eintrag auf 'H' setzen
    const { error: historyError } = await supabase
      .from(tableName)
      .update({ 
        record_type: 'H',
        modified_at: new Date().toISOString(),
        modified_by: newData.modified_by || oldData.modified_by
      })
      .eq('id', id);
      
    if (historyError) {
      console.error(`Error historizing ${tableName} entry:`, historyError);
      throw new Error(`Error historizing ${tableName} entry: ${historyError.message}`);
    }
    
    try {
      // 3. Kombiniere alte Daten mit neuen Daten und setze record_type auf 'C'
      // Wichtig: Wir entfernen hier die ID, um eine neue zu generieren 
      // und wir entfernen eventuell vorhandene unique constraints (group_id, judge_id, tournament_id)
      const { id: oldId, ...dataWithoutId } = oldData;
      
      // Log what we're doing for debugging
      console.log(`Creating new record for ${tableName} after historizing ID ${id}`);
      
      // Kombiniere alte Daten mit neuen Daten und setze record_type auf 'C'
      const insertData = {
        ...dataWithoutId,
        ...newData,
        record_type: 'C',
        modified_at: new Date().toISOString()
      };
      
      console.log('New record data:', insertData);
      
      // 4. Neuen Eintrag einfügen
      const { data: newEntry, error: insertError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error creating new ${tableName} entry:`, insertError);
        
        // Wenn der Fehler auf eine Unique Constraint zurückzuführen ist, versuchen wir
        // den alten Eintrag auf 'C' zurückzusetzen
        if (insertError.message.includes('violates unique constraint')) {
          console.log('Unique constraint violation detected, updating instead of inserting');
          
          // Alle Aktualisierungen (C - Records) für diese Kombination auf 'H' setzen
          if (tableName === 'group_scores' && 'group_id' in oldData && 'tournament_id' in oldData && 'judge_id' in oldData) {
            await supabase
              .from(tableName)
              .update({ 
                record_type: 'H',
                modified_at: new Date().toISOString(),
                modified_by: newData.modified_by || oldData.modified_by
              })
              .eq('group_id', oldData.group_id)
              .eq('judge_id', oldData.judge_id)
              .eq('tournament_id', oldData.tournament_id)
              .eq('record_type', 'C');
            
            // Delay to ensure consistency
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Dann den neuen Eintrag erneut versuchen
            const { data: retryEntry, error: retryError } = await supabase
              .from(tableName)
              .insert([insertData])
              .select()
              .single();
              
            if (retryError) {
              // Wenn immer noch ein Fehler auftritt, den ursprünglichen Eintrag wiederherstellen
              await supabase
                .from(tableName)
                .update({ record_type: 'C' })
                .eq('id', id);
                
              throw new Error(`Error creating new ${tableName} entry after retry: ${retryError.message}`);
            }
            
            return retryEntry;
          }
        }
        
        // In case of error, try to roll back the history operation
        await supabase
          .from(tableName)
          .update({ record_type: 'C' })
          .eq('id', id);
          
        throw new Error(`Error creating new ${tableName} entry: ${insertError.message}`);
      }
      
      return newEntry;
    } catch (error) {
      console.error(`Error in historizeAndCreate for ${tableName}:`, error);
      
      // Versuch, den alten Eintrag wiederherzustellen
      await supabase
        .from(tableName)
        .update({ record_type: 'C' })
        .eq('id', id);
        
      throw error;
    }
  }
}
