
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Tournament } from '@/types';
import { SupabaseService } from '@/services/SupabaseService';
import { TournamentService } from '@/services/TournamentService';
import { useToast } from '@/hooks/use-toast';
import { TournamentContextType } from '@/contexts/user/types';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActive] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const fetchedTournaments = await TournamentService.getAllTournaments();
        setTournaments(fetchedTournaments);
        
        // Get active tournament
        const storedTournamentId = sessionStorage.getItem('activeTournamentId');
        if (storedTournamentId) {
          const storedTournament = fetchedTournaments.find(
            t => t.id.toString() === storedTournamentId
          );
          if (storedTournament) {
            setActive(storedTournament);
          }
        }
        
        // If no stored tournament, use the one marked as active
        if (!activeTournament) {
          const active = fetchedTournaments.find(t => t.isActive);
          if (active) {
            setActive(active);
          }
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: "Fehler",
          description: "Die Turniere konnten nicht geladen werden.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const setActiveTournament = async (tournament: Tournament) => {
    try {
      setIsLoading(true);
      
      // Update in database
      await TournamentService.setActiveTournament(tournament.id);
      
      // Update local state
      setActive(tournament);
      
      // Store in session storage
      sessionStorage.setItem('activeTournamentId', tournament.id.toString());
      
      // Update tournaments list with new active state
      setTournaments(prevTournaments => 
        prevTournaments.map(t => ({
          ...t,
          isActive: t.id === tournament.id
        }))
      );
      
      toast({
        title: "Turnier aktiviert",
        description: `${tournament.name} ist jetzt das aktive Turnier.`
      });
    } catch (error) {
      console.error('Error setting active tournament:', error);
      toast({
        title: "Fehler",
        description: "Das aktive Turnier konnte nicht gesetzt werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the updateTournament method
  const updateTournament = async (tournament: Tournament) => {
    try {
      setIsLoading(true);
      
      // Update tournament in database
      await TournamentService.updateTournament(tournament);
      
      // Update in local state
      setTournaments(prevTournaments => 
        prevTournaments.map(t => 
          t.id === tournament.id ? tournament : t
        )
      );
      
      // If this is the active tournament, update it as well
      if (activeTournament && activeTournament.id === tournament.id) {
        setActive(tournament);
      }
      
      // If marked as active, update all other tournaments to be inactive
      if (tournament.isActive) {
        await setActiveTournament(tournament);
      }
      
      toast({
        title: "Turnier aktualisiert",
        description: `${tournament.name} wurde erfolgreich aktualisiert.`
      });
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: "Fehler",
        description: "Das Turnier konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the addTournament method
  const addTournament = async (tournament: Tournament) => {
    try {
      setIsLoading(true);
      
      // Create tournament in database
      const newTournament = await TournamentService.createTournament({
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        year: tournament.year,
        isActive: tournament.isActive
      });
      
      // Add to local state
      setTournaments(prevTournaments => [...prevTournaments, newTournament]);
      
      // If marked as active, set it as the active tournament
      if (tournament.isActive) {
        await setActiveTournament(newTournament);
      }
      
      toast({
        title: "Turnier erstellt",
        description: `${tournament.name} wurde erfolgreich erstellt.`
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Fehler",
        description: "Das Turnier konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the deleteTournament method
  const deleteTournament = async (tournamentId: number) => {
    try {
      setIsLoading(true);
      
      // Delete tournament from database
      await TournamentService.deleteTournament(tournamentId);
      
      // Remove from local state
      setTournaments(prevTournaments => 
        prevTournaments.filter(t => t.id !== tournamentId)
      );
      
      // If this was the active tournament, clear it
      if (activeTournament && activeTournament.id === tournamentId) {
        setActive(null);
        sessionStorage.removeItem('activeTournamentId');
        
        // Find another tournament to set as active if available
        const remainingTournaments = tournaments.filter(t => t.id !== tournamentId);
        if (remainingTournaments.length > 0) {
          await setActiveTournament(remainingTournaments[0]);
        }
      }
      
      toast({
        title: "Turnier gelöscht",
        description: "Das Turnier wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Fehler",
        description: "Das Turnier konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    tournaments,
    activeTournament,
    setActiveTournament,
    updateTournament,
    addTournament,
    deleteTournament,
    isLoading
  }), [tournaments, activeTournament, isLoading]);

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = (): TournamentContextType => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
