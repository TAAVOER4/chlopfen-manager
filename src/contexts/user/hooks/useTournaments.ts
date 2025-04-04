
import { useState, useEffect } from 'react';
import { User, Tournament } from '@/types';
import { BaseSupabaseService } from '@/services/BaseSupabaseService';

export const useTournaments = (currentUser: User | null) => {
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTournaments = async () => {
      if (!currentUser) {
        setAvailableTournaments([]);
        setSelectedTournament(null);
        return;
      }

      setIsLoading(true);
      try {
        let query = BaseSupabaseService.getClient().from('tournaments').select('*');

        // Admin users can see all tournaments
        // Readers and editors can only see assigned tournaments
        if (currentUser.role !== 'admin') {
          if (currentUser.tournamentIds && currentUser.tournamentIds.length > 0) {
            query = query.in('id', currentUser.tournamentIds);
          } else {
            // If user has no assigned tournaments, don't return any
            setAvailableTournaments([]);
            setSelectedTournament(null);
            setIsLoading(false);
            return;
          }
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) {
          console.error('Error loading tournaments:', error);
          return;
        }

        if (data && data.length > 0) {
          // Convert database fields to match our Tournament type
          const tournaments = data.map(t => ({
            id: t.id,
            name: t.name,
            date: t.date,
            location: t.location,
            year: t.year,
            isActive: t.is_active // Map from is_active to isActive
          })) as Tournament[];
          
          setAvailableTournaments(tournaments);

          // Set selected tournament to active one or first one
          const activeTournament = tournaments.find(t => t.isActive);
          setSelectedTournament(activeTournament || tournaments[0]);
        }
      } catch (error) {
        console.error('Error in loadTournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTournaments();
  }, [currentUser]);

  return {
    availableTournaments,
    selectedTournament,
    setSelectedTournament,
    isLoading
  };
};
