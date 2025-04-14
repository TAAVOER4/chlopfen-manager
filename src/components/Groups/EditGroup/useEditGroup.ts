
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GroupFormValues, groupSchema } from '@/components/Groups/GroupInfoForm';
import { Group, GroupCategory, GroupSize, Participant } from '@/types';
import { useGroupForm } from '@/hooks/useGroupForm';
import { supabase } from '@/lib/supabase';
import { useTournament } from '@/contexts/TournamentContext';
import { isDuplicateGroup } from '@/utils/groupUtils';

export const useEditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { activeTournament } = useTournament();
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids_juniors",
      size: "three",
    },
  });

  // Load group data
  useEffect(() => {
    const loadGroup = async () => {
      if (!id) return;
      
      try {
        setIsLoadingGroups(true);
        const groupId = parseInt(id);
        
        // Fetch group data directly from Supabase
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
          
        if (error) {
          console.error("Error loading group:", error);
          return;
        }
        
        if (!data) {
          console.error("Group not found with ID:", groupId);
          return;
        }
        
        // Fetch participant relationships
        const { data: groupParticipants, error: relError } = await supabase
          .from('group_participants')
          .select('participant_id')
          .eq('group_id', groupId);
          
        if (relError) {
          console.error("Error loading group participants:", relError);
        }
        
        const participantIds = (groupParticipants || []).map(gp => gp.participant_id);
        
        // Create group object
        const foundGroup: Group = {
          id: data.id,
          name: data.name,
          category: data.category,
          size: data.size,
          participantIds: participantIds,
          tournamentId: data.tournament_id,
          displayOrder: data.display_order
        };
        
        console.log("Found group:", foundGroup);
        setGroup(foundGroup);
        
        form.setValue('name', foundGroup.name);
        form.setValue('category', foundGroup.category);
        form.setValue('size', foundGroup.size);
      } catch (error) {
        console.error("Error in loadGroup:", error);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    loadGroup();
  }, [id, form]);
  
  // Load participants data
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setIsLoadingParticipants(true);
        
        // Fetch participants directly from Supabase
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false });
          
        if (error) {
          console.error("Error loading participants:", error);
          return;
        }
        
        // Transform data to frontend model
        const transformedData = data.map(participant => ({
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
        }));
        
        setParticipants(transformedData);
        
        // Now fetch all group-participant relationships to populate groupIds
        const { data: groupParticipants, error: relError } = await supabase
          .from('group_participants')
          .select('*');
          
        if (relError) {
          console.error("Error loading group-participant relationships:", relError);
          return;
        }
        
        // Populate groupIds for each participant
        transformedData.forEach(participant => {
          participant.groupIds = (groupParticipants || [])
            .filter(gp => gp.participant_id === participant.id)
            .map(gp => gp.group_id);
        });
        
        setParticipants([...transformedData]);
      } catch (error) {
        console.error("Error in loadParticipants:", error);
      } finally {
        setIsLoadingParticipants(false);
      }
    };
    
    loadParticipants();
  }, []);

  // Initialize selected participants based on group participantIds
  const initialParticipants = useMemo(() => {
    if (!group || !participants.length) return [];
    
    const groupParticipants = participants.filter(p => group.participantIds.includes(p.id));
    console.log("Initial participants for group:", groupParticipants);
    return groupParticipants;
  }, [group, participants]);
  
  const {
    selectedParticipants,
    setSelectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName
  } = useGroupForm({ 
    form, 
    initialParticipants,
    currentGroupId: group?.id
  });

  // Make sure we set the selected participants when initialParticipants change
  useEffect(() => {
    if (initialParticipants.length > 0) {
      setSelectedParticipants(initialParticipants);
    }
  }, [initialParticipants, setSelectedParticipants]);

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    try {
      // First delete group-participant relationships
      const { error: relError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (relError) {
        console.error("Error deleting group-participant relationships:", relError);
        throw relError;
      }
      
      // Then delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);
        
      if (error) {
        console.error("Error deleting group:", error);
        throw error;
      }
      
      toast({
        title: "Gruppe gelöscht",
        description: `${group.name} wurde erfolgreich gelöscht.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Gruppe konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: GroupFormValues) => {
    if (!group || !activeTournament) return;
    
    if (selectedParticipants.length === 0) {
      toast({
        title: "Keine Teilnehmer ausgewählt",
        description: "Bitte wählen Sie mindestens einen Teilnehmer aus.",
        variant: "destructive"
      });
      return;
    }

    const requiredParticipants = data.size === 'three' ? 3 : 4;
    if (selectedParticipants.length !== requiredParticipants) {
      toast({
        title: "Falsche Anzahl an Teilnehmern",
        description: `Eine ${data.size === 'three' ? 'Dreier' : 'Vierer'}gruppe muss genau ${requiredParticipants} Teilnehmer haben.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const participantIds = selectedParticipants.map(p => p.id);
      
      // Check if a duplicate group already exists (excluding the current group)
      const isDuplicate = await isDuplicateGroup(participantIds, data.size, group.id);
      if (isDuplicate) {
        toast({
          title: "Doppelte Gruppe",
          description: "Es existiert bereits eine Gruppe mit genau diesen Teilnehmern.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update group in database
      const { error } = await supabase
        .from('groups')
        .update({
          name: data.name,
          category: data.category,
          size: data.size,
          tournament_id: activeTournament.id
        })
        .eq('id', group.id);
        
      if (error) {
        console.error("Error updating group:", error);
        throw error;
      }
      
      // Remove existing participant associations
      const { error: deleteError } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', group.id);
        
      if (deleteError) {
        console.error("Error deleting group-participant relationships:", deleteError);
        throw deleteError;
      }
      
      // Add new participant associations
      const groupParticipants = selectedParticipants.map(p => ({
        group_id: group.id,
        participant_id: p.id
      }));
      
      const { error: insertError } = await supabase
        .from('group_participants')
        .insert(groupParticipants);
        
      if (insertError) {
        console.error("Error creating group-participant relationships:", insertError);
        throw insertError;
      }
      
      toast({
        title: "Gruppe aktualisiert",
        description: `${data.name} wurde erfolgreich aktualisiert.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Gruppe konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    group,
    isLoadingGroups,
    isLoadingParticipants,
    isSubmitting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName,
    handleDeleteGroup,
    onSubmit,
  };
};
