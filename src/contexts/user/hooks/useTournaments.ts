
import { useState, useEffect, useMemo } from 'react';
import { Tournament, User } from '@/types';
import { BaseSupabaseService } from '@/services/BaseSupabaseService';

export const useTournaments = (currentUser: User | null) => {
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load tournaments from Supabase
  useEffect(() => {
    const loadTournaments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await BaseSupabaseService.getClient()
          .from('tournaments')
          .select('*');
          
        if (error) {
          console.error('Error loading tournaments:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Loaded tournaments:', data);
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
              console.log('Set tournament from storage:', tournamentFromStorage);
            } else if (activeTournament) {
              setSelectedTournament(activeTournament);
              console.log('Set active tournament:', activeTournament);
            } else if (formattedTournaments.length > 0) {
              setSelectedTournament(formattedTournaments[0]);
              console.log('Set first tournament as default:', formattedTournaments[0]);
            }
          } else if (activeTournament) {
            setSelectedTournament(activeTournament);
            console.log('Set active tournament as default:', activeTournament);
          } else if (formattedTournaments.length > 0) {
            setSelectedTournament(formattedTournaments[0]);
            console.log('Set first tournament as default:', formattedTournaments[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTournaments();
  }, []);

  // Update when current user changes
  useEffect(() => {
    if (currentUser) {
      console.log('Current user changed, loading user tournaments');
      const loadUserTournaments = async () => {
        try {
          // For non-admin users, fetch their specific tournament assignments
          if (currentUser.role === 'reader' || currentUser.role === 'editor') {
            const { data, error } = await BaseSupabaseService.getClient()
              .from('user_tournaments')
              .select('tournament_id')
              .eq('user_id', currentUser.id.toString());
              
            if (!error && data) {
              currentUser.tournamentIds = data.map(ut => ut.tournament_id);
              console.log('User tournament IDs:', currentUser.tournamentIds);
            }
          }
        } catch (err) {
          console.error('Error loading user tournament assignments:', err);
        }
      };
      
      loadUserTournaments();
    }
  }, [currentUser]);

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

  // Set selected tournament handler with persistence
  const handleSetSelectedTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    sessionStorage.setItem('activeTournamentId', tournament.id.toString());
    console.log('Set active tournament:', tournament);
  };

  return {
    availableTournaments: userTournaments,
    selectedTournament,
    isLoading,
    setSelectedTournament: handleSetSelectedTournament
  };
};
