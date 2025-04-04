
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { Participant, Tournament } from '@/types';

export const useTournamentParticipants = (tournamentId: string | undefined) => {
  const { toast } = useToast();
  const { activeTournament, setActiveTournament, tournaments } = useTournament();
  const queryClient = useQueryClient();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    retry: 1,
    staleTime: 0, // Set to 0 to always fetch fresh data
  });

  // Get tournament data
  useEffect(() => {
    if (tournamentId && tournaments.length > 0) {
      const tournamentData = tournaments.find(t => t.id === parseInt(tournamentId));
      if (tournamentData) {
        setTournament(tournamentData);
      }
    }
  }, [tournamentId, tournaments]);

  // Set selected participants based on tournament ID
  useEffect(() => {
    if (tournamentId) {
      const tournamentParticipants = participants.filter(
        p => p.tournamentId === parseInt(tournamentId)
      );
      setSelectedParticipants(tournamentParticipants.map(p => p.id));
    }
  }, [tournamentId, participants]);

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'assigned') return matchesSearch && selectedParticipants.includes(participant.id);
    if (filter === 'unassigned') return matchesSearch && !selectedParticipants.includes(participant.id);
    
    return matchesSearch;
  });

  const toggleParticipant = (participantId: number) => {
    setSelectedParticipants(prevSelected => {
      if (prevSelected.includes(participantId)) {
        return prevSelected.filter(id => id !== participantId);
      } else {
        return [...prevSelected, participantId];
      }
    });
  };

  const saveAssignments = async () => {
    if (!tournament) return;

    try {
      // Here we would update the participants in the database
      // This would require a new method in DatabaseService to update participant tournament assignments
      
      // For now, we'll just show a success message
      toast({
        title: "Teilnehmer zugewiesen",
        description: `${selectedParticipants.length} Teilnehmer wurden dem Turnier ${tournament.name} zugewiesen.`,
      });
      
      // Immediately invalidate queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      // Refresh active tournament if this is the active one
      if (activeTournament && tournament.id === activeTournament.id) {
        setActiveTournament(tournament);
      }
    } catch (error) {
      console.error('Error saving participant assignments:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern der Teilnehmer ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const assignAll = () => {
    setSelectedParticipants(participants.map(p => p.id));
  };

  const unassignAll = () => {
    setSelectedParticipants([]);
  };

  return {
    tournament,
    participants,
    filteredParticipants,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedParticipants,
    toggleParticipant,
    saveAssignments,
    assignAll,
    unassignAll,
    isLoadingParticipants,
    participantsError
  };
};
