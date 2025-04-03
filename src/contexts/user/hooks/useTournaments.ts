
import { useState, useEffect, useMemo } from 'react';
import { Tournament, User } from '@/types';
import { SupabaseService } from '@/services/SupabaseService';

export const useTournaments = (currentUser: User | null) => {
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Load tournaments from Supabase
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

  // Filter tournaments based on user role
  const userTournaments = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin' || currentUser.role === 'judge') {
      return availableTournaments;
    }
    
    return availableTournaments.filter(tournament => 
      currentUser.tournamentIds?.includes(tournament.id)
    );
  }, [currentUser, availableTournaments]);

  return {
    availableTournaments: userTournaments,
    selectedTournament,
    setSelectedTournament
  };
};
