import { useState, useEffect, useMemo } from 'react';
import { User, Tournament } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';

export const useUserState = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const { data, error } = await SupabaseService.supabase
          .from('tournaments')
          .select('*');
          
        if (error) {
          console.error('Error loading tournaments:', error);
          return;
        }
        
        if (data) {
          const formattedTournaments: Tournament[] = data.map(t => ({
            id: t.id,
            name: t.name,
            date: t.date,
            location: t.location,
            year: t.year,
            isActive: t.is_active
          }));
          setAvailableTournaments(formattedTournaments);
          
          const activeTournament = formattedTournaments.find(t => t.isActive);
          const storedTournamentId = sessionStorage.getItem('activeTournamentId');
          
          if (storedTournamentId) {
            const tournamentFromStorage = formattedTournaments.find(
              t => t.id.toString() === storedTournamentId
            );
            if (tournamentFromStorage) {
              setSelectedTournament(tournamentFromStorage);
            } else if (activeTournament) {
              setSelectedTournament(activeTournament);
            }
          } else if (activeTournament) {
            setSelectedTournament(activeTournament);
          }
        }
      } catch (error) {
        console.error('Failed to load tournaments:', error);
      }
    };
    
    loadTournaments();
  }, []);

  useEffect(() => {
    const savedUserJSON = localStorage.getItem('currentUser');
    const impersonatedUserJSON = localStorage.getItem('impersonatedUser');
    const isAdminMode = localStorage.getItem('adminMode') === 'true';

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

  const userTournaments = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin' || currentUser.role === 'judge') {
      return availableTournaments;
    }
    
    return availableTournaments.filter(tournament => 
      currentUser.tournamentIds?.includes(tournament.id)
    );
  }, [currentUser, availableTournaments]);

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
        
        const userToStore = { ...authenticatedUser };
        delete (userToStore as any).passwordHash;
        
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        
        const activeTournament = availableTournaments.find(t => t.isActive);
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
    availableTournaments: userTournaments,
    selectedTournament,
    setSelectedTournament,
    originalAdmin
  };
};
