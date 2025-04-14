
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
  
  // Direct Supabase queries to bypass the service layer for debugging
  const fetchParticipantsDirectly = async () => {
    console.log("Direct fetching of participants...");
    
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error directly loading participants:', error);
        throw error;
      }
      
      console.log("Directly fetched participants:", data?.length || 0);
      
      // Map the database column names to the frontend property names
      const transformedData = data?.map(participant => ({
        id: participant.id,
        firstName: participant.first_name,
        lastName: participant.last_name,
        location: participant.location,
        birthYear: participant.birth_year,
        category: participant.category,
        isGroupOnly: participant.is_group_only || false,
        tournamentId: participant.tournament_id,
        displayOrder: participant.display_order,
        groupIds: []
      })) || [];
      
      // Fetch group associations for all participants
      const { data: groupParticipants, error: groupError } = await supabase
        .from('group_participants')
        .select('*');
        
      if (groupError) {
        console.error('Error directly loading group participants:', groupError);
      }
      
      if (groupParticipants) {
        // Populate groupIds for each participant
        transformedData.forEach(participant => {
          participant.groupIds = groupParticipants
            .filter(gp => gp.participant_id === participant.id)
            .map(gp => gp.group_id);
        });
      }
      
      return transformedData as Participant[];
    } catch (error) {
      console.error('Error in direct participant fetch:', error);
      throw error;
    }
  };
  
  const fetchGroupsDirectly = async () => {
    console.log("Direct fetching of groups...");
    
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error('Error directly loading groups:', error);
        throw error;
      }
      
      console.log("Directly fetched groups:", data?.length || 0);
      
      // Create a list of all group IDs to fetch participant relationships
      const groupIds = data?.map(group => group.id) || [];
      
      // Map the database column names to the frontend property names
      const transformedData = data?.map(group => ({
        id: group.id,
        name: group.name,
        category: group.category,
        size: group.size,
        tournamentId: group.tournament_id,
        displayOrder: group.display_order,
        participantIds: []
      })) || [];
      
      // If there are no groups, return empty array
      if (groupIds.length === 0) return transformedData;
      
      // Fetch all group-participant relationships for the groups
      const { data: groupParticipants, error: relError } = await supabase
        .from('group_participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (relError) {
        console.error('Error directly loading group-participant relationships:', relError);
      } else if (groupParticipants) {
        // Populate participantIds for each group
        transformedData.forEach(group => {
          group.participantIds = groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id);
        });
      }
      
      return transformedData as Group[];
    } catch (error) {
      console.error('Error in direct group fetch:', error);
      throw error;
    }
  };
  
  // Fetch participants directly from Supabase
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants', activeTournament?.id],
    queryFn: fetchParticipantsDirectly,
    staleTime: 0,
    gcTime: 0,
    retry: 2
  });
  
  // Fetch groups directly from Supabase
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups', activeTournament?.id],
    queryFn: fetchGroupsDirectly,
    staleTime: 0,
    gcTime: 0,
    retry: 2
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
  
  const handleDeleteClick = useCallback((participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  }, []);
  
  const handleParticipantDeleted = useCallback(() => {
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
