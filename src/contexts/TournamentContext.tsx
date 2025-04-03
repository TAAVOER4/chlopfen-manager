
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Tournament } from '@/types';
import { SupabaseService } from '@/services/SupabaseService';
import { useToast } from '@/hooks/use-toast';

interface TournamentContextType {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  setActiveTournament: (tournament: Tournament) => Promise<void>;
  isLoading: boolean;
}

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
        const fetchedTournaments = await SupabaseService.getAllTournaments();
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
      await SupabaseService.setActiveTournament(tournament.id);
      
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

  const value = useMemo(() => ({
    tournaments,
    activeTournament,
    setActiveTournament,
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
