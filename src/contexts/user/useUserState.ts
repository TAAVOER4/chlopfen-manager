
import { useState, useEffect, useMemo } from 'react';
import { User, Tournament } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { mockTournaments, getActiveTournament } from '@/data/mockTournaments';
import { SupabaseService } from '@/services/SupabaseService';

export const useUserState = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUserJSON = localStorage.getItem('currentUser');
    const impersonatedUserJSON = localStorage.getItem('impersonatedUser');
    const isAdminMode = localStorage.getItem('adminMode') === 'true';

    const activeTournament = getActiveTournament();
    if (activeTournament) {
      setSelectedTournament(activeTournament);
    }

    if (savedUserJSON) {
      try {
        const savedUser = JSON.parse(savedUserJSON) as User;
        setCurrentUser(savedUser);
        
        if (isAdminMode && impersonatedUserJSON) {
          try {
            const impersonatedUser = JSON.parse(impersonatedUserJSON) as User;
            if (savedUser.id !== impersonatedUser.id) {
              setOriginalAdmin(savedUser);
            }
          } catch (e) {
            console.error('Error parsing impersonated user:', e);
          }
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const isJudge = !!currentUser && currentUser.role === 'judge';
  const isReader = !!currentUser && currentUser.role === 'reader';
  const isEditor = !!currentUser && currentUser.role === 'editor';
  const isImpersonating = !!originalAdmin;

  const availableTournaments = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin' || currentUser.role === 'judge') {
      return mockTournaments;
    }
    
    return mockTournaments.filter(tournament => 
      currentUser.tournamentIds?.includes(tournament.id)
    );
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt with:', email);
      setIsLoading(true);
      
      // Initialize users if needed
      try {
        await SupabaseService.initializeUsers();
      } catch (initError) {
        console.error('Initialization error:', initError);
        // Continue with login attempt even if initialization fails
      }
      
      // Authenticate user
      const authenticatedUser = await SupabaseService.authenticateUser(email, password);
      
      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
        
        const userToStore = { ...authenticatedUser };
        delete (userToStore as any).passwordHash;
        
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        
        const activeTournament = getActiveTournament();
        if (activeTournament) {
          setSelectedTournament(activeTournament);
        }
        
        toast({
          title: "Anmeldung erfolgreich",
          description: `Willkommen, ${authenticatedUser.name}!`
        });
        
        return true;
      } else {
        console.log('Authentication failed');
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Falsche E-Mail oder falsches Passwort.",
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
    setSelectedTournament(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('adminMode');
    
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden erfolgreich abgemeldet."
    });
  };

  const impersonate = (user: User) => {
    if (!originalAdmin && currentUser?.role === 'admin') {
      setOriginalAdmin(currentUser);
      localStorage.setItem('adminMode', 'true');
    }
    
    setCurrentUser(user);
    
    const userToStore = { ...user };
    delete (userToStore as any).passwordHash;
    
    localStorage.setItem('impersonatedUser', JSON.stringify(userToStore));
    
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
    isAdmin,
    isJudge,
    isReader,
    isEditor,
    isImpersonating,
    isLoading,
    login,
    logout,
    impersonate,
    stopImpersonating,
    availableTournaments,
    selectedTournament,
    setSelectedTournament,
    originalAdmin
  };
};
