
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';
import { useLocalStorage } from './useLocalStorage';

export const useAuthentication = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    saveUserToLocalStorage,
    saveImpersonatedUserToLocalStorage,
    loadUserFromLocalStorage,
    loadImpersonatedUserFromLocalStorage,
    clearUserFromLocalStorage
  } = useLocalStorage();

  // Initialize from localStorage
  const initFromLocalStorage = () => {
    const savedUser = loadUserFromLocalStorage();
    if (savedUser) {
      setCurrentUser(savedUser);
      
      const impersonatedUser = loadImpersonatedUserFromLocalStorage();
      if (impersonatedUser && savedUser.id !== impersonatedUser.id) {
        setOriginalAdmin(savedUser);
      }
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt with:', username);
      setIsLoading(true);
      
      try {
        await SupabaseService.initializeUsers();
      } catch (initError) {
        console.error('Initialization error:', initError);
      }
      
      const authenticatedUser = await SupabaseService.authenticateUser(username, password);
      
      if (authenticatedUser) {
        if (authenticatedUser.role === 'reader' || authenticatedUser.role === 'editor') {
          try {
            const { data: userTournaments, error } = await SupabaseService.supabase
              .from('user_tournaments')
              .select('tournament_id')
              .eq('user_id', authenticatedUser.id.toString());
              
            if (!error && userTournaments) {
              authenticatedUser.tournamentIds = userTournaments.map(ut => ut.tournament_id);
            }
          } catch (err) {
            console.error('Error loading user tournament assignments:', err);
          }
        }
        
        setCurrentUser(authenticatedUser);
        saveUserToLocalStorage(authenticatedUser);
        
        toast({
          title: "Anmeldung erfolgreich",
          description: `Willkommen, ${authenticatedUser.name}!`
        });
        
        return true;
      } else {
        console.log('Authentication failed');
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Falscher Benutzername oder falsches Passwort.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setOriginalAdmin(null);
    clearUserFromLocalStorage();
    
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden erfolgreich abgemeldet."
    });
  };

  const impersonate = (user: User) => {
    if (!originalAdmin && currentUser?.role === 'admin') {
      setOriginalAdmin(currentUser);
    }
    
    setCurrentUser(user);
    saveImpersonatedUserToLocalStorage(user);
    
    toast({
      title: "Benutzer wechseln",
      description: `Sie agieren jetzt als ${user.name} (${
        user.role === 'admin' ? 'Administrator' : 
        user.role === 'judge' ? 'Richter' : 
        user.role === 'reader' ? 'Nur Lesen' : 'Bearbeiter'
      }).`
    });
  };

  const stopImpersonating = () => {
    if (originalAdmin) {
      setCurrentUser(originalAdmin);
      setOriginalAdmin(null);
      localStorage.removeItem('adminMode');
      localStorage.removeItem('impersonatedUser');
      
      toast({
        title: "Zurück zum Admin-Modus",
        description: "Sie sind jetzt wieder als Administrator angemeldet."
      });
    }
  };

  return {
    currentUser,
    originalAdmin,
    isLoading,
    initFromLocalStorage,
    login,
    logout,
    impersonate,
    stopImpersonating,
    setCurrentUser,
  };
};
