
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { Participant, Group } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useParticipantsData = () => {
  const { activeTournament } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants', activeTournament?.id],
    queryFn: () => {
      console.log("Fetching participants...");
      return DatabaseService.getAllParticipants();
    },
    staleTime: 0, // Set to 0 to always fetch fresh data
    onError: (error) => {
      console.error("Error fetching participants:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnten nicht geladen werden",
        variant: "destructive"
      });
    }
  });
  
  // Fetch groups from the database
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups', activeTournament?.id],
    queryFn: () => {
      console.log("Fetching groups...");
      return DatabaseService.getAllGroups();
    },
    staleTime: 0, // Set to 0 to always fetch fresh data
    onError: (error) => {
      console.error("Error fetching groups:", error);
      toast({
        title: "Fehler",
        description: "Gruppen konnten nicht geladen werden",
        variant: "destructive"
      });
    }
  });
  
  // Filter participants by tournament
  const tournamentParticipants = useMemo(() => {
    console.log("Filtering participants by tournament:", activeTournament?.id);
    console.log("Total participants:", participants.length);
    return activeTournament 
      ? participants.filter(p => p.tournamentId === activeTournament.id)
      : [];
  }, [participants, activeTournament]);
  
  // Filter participants based on search term and category
  const filteredParticipants = useMemo(() => {
    console.log("Filtering participants by search and category");
    return tournamentParticipants.filter(participant => {
      const matchesSearch = 
        `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'groupOnly' && participant.isGroupOnly) || 
        participant.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [tournamentParticipants, searchTerm, selectedCategory]);
  
  const handleDeleteClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };
  
  const handleParticipantDeleted = () => {
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  };
  
  const getGroupsForParticipant = (participantId: number): Group[] => {
    if (!groups || !activeTournament) return [];
    return groups.filter(group => 
      group.participantIds.includes(participantId) && 
      group.tournamentId === activeTournament.id
    );
  };

  // Add manual refetch methods
  const refetchAll = () => {
    console.log("Manually refetching all data...");
    refetchParticipants();
    refetchGroups();
  };

  return {
    participants,
    groups,
    tournamentParticipants,
    filteredParticipants,
    activeTournament,
    searchTerm,
    selectedCategory,
    selectedParticipant,
    deleteDialogOpen,
    isLoading: isLoadingParticipants || isLoadingGroups,
    error: participantsError || groupsError,
    setSearchTerm,
    setSelectedCategory,
    setSelectedParticipant,
    setDeleteDialogOpen,
    handleDeleteClick,
    handleParticipantDeleted,
    getGroupsForParticipant,
    refetchAll
  };
};
