
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
        modified_at: new Date().toISOString() 
      })
      .eq('id', id);
      
    if (historyError) {
      console.error(`Error historizing ${tableName} entry:`, historyError);
      throw new Error(`Error historizing ${tableName} entry: ${historyError.message}`);
    }
    
    // 3. Neuen Eintrag mit 'C' erstellen, dabei ID weglassen damit eine neue generiert wird
    const { id: oldId, ...dataWithoutId } = oldData;
    
    // Kombiniere alte Daten mit neuen Daten und setze record_type auf 'C'
    const insertData = {
      ...dataWithoutId,
      ...newData,
      record_type: 'C'
    };
    
    try {
      // 4. Neuen Eintrag einfügen
      const { data: newEntry, error: insertError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();
        
      if (insertError) {
        console.error(`Error creating new ${tableName} entry:`, insertError);
        
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
      throw error;
    }
  }
}
