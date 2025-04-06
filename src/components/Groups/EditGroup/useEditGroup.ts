
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GroupFormValues, groupSchema } from '@/components/Groups/GroupInfoForm';
import { Group, GroupCategory, GroupSize } from '@/types';
import { useGroupForm } from '@/hooks/useGroupForm';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { useQuery } from '@tanstack/react-query';

export const useEditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeTournament } = useTournament();
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids_juniors",
      size: "three",
    },
  });
  
  // Fetch all groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: DatabaseService.getAllGroups,
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch participants for the current group
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    staleTime: 5 * 60 * 1000,
  });

  // Find the group from the fetched data
  useEffect(() => {
    if (!id || isLoadingGroups || groups.length === 0) return;
    
    const groupId = parseInt(id);
    const foundGroup = groups.find(g => g.id === groupId);
    
    if (!foundGroup) {
      console.error("Group not found with ID:", groupId);
      return;
    }
    
    console.log("Found group:", foundGroup);
    setGroup(foundGroup);
    
    form.setValue('name', foundGroup.name);
    form.setValue('category', foundGroup.category);
    form.setValue('size', foundGroup.size);
  }, [id, form, groups, isLoadingGroups]);

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
      await DatabaseService.deleteGroup(group.id);
      
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
      
      const updatedGroup: Group = {
        id: group.id,
        name: data.name,
        category: data.category as GroupCategory,
        size: data.size as GroupSize,
        participantIds: selectedParticipants.map(p => p.id),
        tournamentId: activeTournament.id,
        displayOrder: group.displayOrder
      };
      
      console.log("Updating group:", updatedGroup);
      await DatabaseService.updateGroup(updatedGroup);
      
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
