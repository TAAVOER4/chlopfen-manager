
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { GroupFormValues } from '@/components/Groups/GroupInfoForm';
import { Participant, GroupSize, GroupCategory } from '@/types';
import { isDuplicateGroup } from '@/utils/groupUtils';
import { mockGroups, mockParticipants } from '@/data/mockData';

interface UseGroupRegistrationProps {
  activeTournament?: {
    id: number;
    name: string;
  };
  selectedParticipants: Participant[];
}

export const useGroupRegistration = ({ activeTournament, selectedParticipants }: UseGroupRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGroupSubmit = (data: GroupFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (!activeTournament) {
        toast({
          title: "Kein aktives Turnier",
          description: "Bitte wählen Sie zuerst ein aktives Turnier aus.",
          variant: "destructive"
        });
        return;
      }

      if (selectedParticipants.length === 0) {
        toast({
          title: "Keine Teilnehmer ausgewählt",
          description: "Bitte wählen Sie mindestens einen Teilnehmer aus.",
          variant: "destructive"
        });
        return;
      }

      // Check if we have the right number of participants for the selected size
      const requiredParticipants = data.size === 'three' ? 3 : 4;
      if (selectedParticipants.length !== requiredParticipants) {
        toast({
          title: "Falsche Anzahl an Teilnehmern",
          description: `Eine ${data.size === 'three' ? 'Dreier' : 'Vierer'}gruppe muss genau ${requiredParticipants} Teilnehmer haben.`,
          variant: "destructive"
        });
        return;
      }

      // Check if a duplicate group already exists
      const participantIds = selectedParticipants.map(p => p.id);
      if (isDuplicateGroup(participantIds)) {
        toast({
          title: "Doppelte Gruppe",
          description: "Es existiert bereits eine Gruppe mit genau diesen Teilnehmern.",
          variant: "destructive"
        });
        return;
      }

      // Create a new group ID
      const newId = Math.max(...mockGroups.map(g => g.id), 0) + 1;
      
      // Create the new group with tournament reference
      const newGroup = {
        id: newId,
        name: data.name,
        size: data.size as GroupSize,
        category: data.category as GroupCategory,
        participantIds: participantIds,
        tournamentId: activeTournament.id
      };
      
      // Update participants to be part of this group
      selectedParticipants.forEach(participant => {
        const index = mockParticipants.findIndex(p => p.id === participant.id);
        if (index !== -1) {
          // Initialize groupIds array if it doesn't exist
          if (!mockParticipants[index].groupIds) {
            mockParticipants[index].groupIds = [];
          }
          // Add the new group id to the participant's groupIds array
          mockParticipants[index].groupIds?.push(newId);
          
          // Ensure the participant is assigned to the active tournament
          if (!mockParticipants[index].tournamentId) {
            mockParticipants[index].tournamentId = activeTournament.id;
          }
        }
      });
      
      // Add the new group to mockGroups
      mockGroups.push(newGroup);
      
      toast({
        title: "Gruppe erstellt",
        description: `${data.name} wurde erfolgreich für ${activeTournament.name} erstellt.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler beim Erstellen der Gruppe aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleGroupSubmit,
    isSubmitting
  };
};
