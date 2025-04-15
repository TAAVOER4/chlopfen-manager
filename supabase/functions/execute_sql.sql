
-- Diese SQL-Funktion wird in der Supabase-Datenbank erstellt, um rohe SQL-Befehle auszuführen
-- Sie muss in der Datenbank manuell angelegt werden

CREATE OR REPLACE FUNCTION public.execute_sql(sql_command TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_command;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error executing SQL: %', SQLERRM;
    RETURN false;
END;
$$;

-- Gewähre Zugriff für authentifizierte Benutzer
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;

-- Add a function specifically for archiving group scores
CREATE OR REPLACE FUNCTION public.force_archive_group_scores(
  p_group_id INTEGER,
  p_tournament_id INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.group_scores
  SET record_type = 'H',
      modified_at = NOW()
  WHERE group_id = p_group_id
  AND tournament_id = p_tournament_id
  AND record_type = 'C';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error archiving group scores: %', SQLERRM;
    RETURN false;
END;
$$;

-- Gewähre Zugriff für authentifizierte Benutzer
GRANT EXECUTE ON FUNCTION public.force_archive_group_scores TO authenticated;
