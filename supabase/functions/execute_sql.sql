
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
