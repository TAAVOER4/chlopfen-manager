
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';
import { BaseSupabaseService } from '@/services/BaseSupabaseService';
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
    console.log('Initializing user from local storage');
    const savedUser = loadUserFromLocalStorage();
    if (savedUser) {
      console.log('User loaded from local storage:', savedUser.username);
      setCurrentUser(savedUser);
      
      const impersonatedUser = loadImpersonatedUserFromLocalStorage();
      if (impersonatedUser && savedUser.id !== impersonatedUser.id) {
        console.log('Admin is impersonating a user');
        setOriginalAdmin(savedUser);
      }
    } else {
      console.log('No user found in local storage');
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt with username:', username);
      setIsLoading(true);
      
      try {
        // Make sure users table is initialized
        console.log('Ensuring users are initialized');
        await AuthService.initializeUsers();
      } catch (initError) {
        console.error('Initialization error:', initError);
      }

      // Authentication flow
      console.log('Starting authentication process');
      const authenticatedUser = await AuthService.authenticateUser(username, password);
      
      if (authenticatedUser) {
        console.log('Authentication successful for user:', authenticatedUser.username);
        
        // For readers and editors, fetch their assigned tournaments
        if (authenticatedUser.role === 'reader' || authenticatedUser.role === 'editor') {
          try {
            console.log('Fetching tournament assignments for user');
            const { data: userTournaments, error } = await BaseSupabaseService.getClient()
              .from('user_tournaments')
              .select('tournament_id')
              .eq('user_id', authenticatedUser.id.toString());
              
            if (!error && userTournaments) {
              authenticatedUser.tournamentIds = userTournaments.map(ut => ut.tournament_id);
              console.log('User tournament assignments loaded:', authenticatedUser.tournamentIds);
            }
          } catch (err) {
            console.error('Error loading user tournament assignments:', err);
          }
        }
        
        console.log('Setting current user and saving to local storage');
        setCurrentUser(authenticatedUser);
        saveUserToLocalStorage(authenticatedUser);
        
        toast({
          title: "Login successful",
          description: `Welcome, ${authenticatedUser.name}!`
        });
        
        return true;
      } else {
        console.log('Authentication failed');
        toast({
          title: "Login failed",
          description: "Incorrect username or password.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An error occurred. Please try again later.",
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
