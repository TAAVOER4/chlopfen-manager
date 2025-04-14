
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useTournament } from '@/contexts/TournamentContext';
import { Participant, Group } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useParticipantsData = () => {
  const { activeTournament } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // First check if Supabase connection is established
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.from('participants').select('count');
        console.log('Supabase connection test:', data ? 'successful' : 'no data');
      } catch (error) {
        console.error('Supabase connection test failed:', error);
      }
    };
    
    checkConnection();
  }, []);
  
  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants', activeTournament?.id],
    queryFn: async () => {
      console.log("Fetching participants...");
      try {
        const result = await DatabaseService.getAllParticipants();
        console.log("Participants fetched:", result.length);
        return result;
      } catch (error) {
        console.error("Error in queryFn for participants:", error);
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,
    retry: 2,
    retryDelay: 1000,
    meta: {
      onSuccess: (data) => {
        console.log("Successfully fetched participants:", data.length);
      },
      onError: (error) => {
        console.error("Error fetching participants:", error);
        toast({
          title: "Fehler",
          description: "Teilnehmer konnten nicht geladen werden",
          variant: "destructive"
        });
      }
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
    queryFn: async () => {
      console.log("Fetching groups...");
      try {
        const result = await DatabaseService.getAllGroups();
        console.log("Groups fetched:", result.length);
        return result;
      } catch (error) {
        console.error("Error in queryFn for groups:", error);
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,
    retry: 2,
    retryDelay: 1000,
    meta: {
      onSuccess: (data) => {
        console.log("Successfully fetched groups:", data.length);
      },
      onError: (error) => {
        console.error("Error fetching groups:", error);
        toast({
          title: "Fehler",
          description: "Gruppen konnten nicht geladen werden",
          variant: "destructive"
        });
      }
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
  
  // Force immediate data refresh when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Initial data fetch triggered");
        await refetchParticipants();
        await refetchGroups();
      } catch (error) {
        console.error("Error during initial data fetch:", error);
      }
    };
    
    fetchAllData();
  }, [refetchParticipants, refetchGroups]);
  
  const handleDeleteClick = useCallback((participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  }, []);
  
  const handleParticipantDeleted = useCallback(() => {
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
    toast({
      title: "Erfolg",
      description: "Teilnehmer wurde gelöscht",
    });
  }, [queryClient]);
  
  const getGroupsForParticipant = useCallback((participantId: number): Group[] => {
    if (!groups || !activeTournament) return [];
    return groups.filter(group => 
      group.participantIds.includes(participantId) && 
      group.tournamentId === activeTournament.id
    );
  }, [groups, activeTournament]);

  // Add manual refetch method
  const refetchAll = useCallback(() => {
    console.log("Manually refetching all data...");
    refetchParticipants();
    refetchGroups();
  }, [refetchParticipants, refetchGroups]);

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
