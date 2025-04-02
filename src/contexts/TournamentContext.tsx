
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tournament } from '@/types';
import { getActiveTournament, mockTournaments } from '@/data/mockTournaments';

interface TournamentContextType {
  activeTournament: Tournament | null;
  tournaments: Tournament[];
  setActiveTournament: (tournament: Tournament) => void;
  updateTournament: (updatedTournament: Tournament) => void;
  addTournament: (tournament: Tournament) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [activeTournament, setActiveTournamentState] = useState<Tournament | null>(null);

  useEffect(() => {
    // Initialize with the active tournament from mock data
    const active = getActiveTournament();
    setActiveTournamentState(active || null);

    // Store active tournament in session storage, if one exists
    if (active) {
      sessionStorage.setItem('activeTournamentId', active.id.toString());
    }
  }, []);

  const setActiveTournament = (tournament: Tournament) => {
    setTournaments(prevTournaments => 
      prevTournaments.map(t => ({
        ...t,
        isActive: t.id === tournament.id
      }))
    );
    setActiveTournamentState(tournament);
    
    // Store the active tournament ID in session storage
    sessionStorage.setItem('activeTournamentId', tournament.id.toString());
  };

  const updateTournament = (updatedTournament: Tournament) => {
    setTournaments(prevTournaments => 
      prevTournaments.map(tournament => 
        tournament.id === updatedTournament.id ? updatedTournament : tournament
      )
    );
    
    if (updatedTournament.isActive) {
      setActiveTournamentState(updatedTournament);
      sessionStorage.setItem('activeTournamentId', updatedTournament.id.toString());
    } else if (activeTournament?.id === updatedTournament.id && !updatedTournament.isActive) {
      setActiveTournamentState(null);
      sessionStorage.removeItem('activeTournamentId');
    }
  };

  const addTournament = (newTournament: Tournament) => {
    setTournaments(prevTournaments => [...prevTournaments, newTournament]);
    
    if (newTournament.isActive) {
      setTournaments(prevTournaments => 
        prevTournaments.map(t => ({
          ...t,
          isActive: t.id === newTournament.id
        }))
      );
      setActiveTournamentState(newTournament);
      sessionStorage.setItem('activeTournamentId', newTournament.id.toString());
    }
  };

  return (
    <TournamentContext.Provider 
      value={{ 
        activeTournament, 
        tournaments, 
        setActiveTournament, 
        updateTournament, 
        addTournament 
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
