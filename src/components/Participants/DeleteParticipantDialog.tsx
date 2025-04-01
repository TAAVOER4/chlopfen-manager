
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { mockParticipants, mockGroups } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '../../types';

interface DeleteParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
  onDeleted: () => void;
}

const DeleteParticipantDialog: React.FC<DeleteParticipantDialogProps> = ({
  open,
  onOpenChange,
  participant,
  onDeleted
}) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (!participant) return;
    
    // Check if participant is in any groups
    if (participant.groupIds && participant.groupIds.length > 0) {
      // Remove participant from all groups
      participant.groupIds.forEach(groupId => {
        const groupIndex = mockGroups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          mockGroups[groupIndex].participantIds = mockGroups[groupIndex].participantIds.filter(
            id => id !== participant.id
          );
          
          // If group is now empty or below required size, consider deleting the group
          if (mockGroups[groupIndex].participantIds.length === 0) {
            mockGroups.splice(groupIndex, 1);
          }
        }
      });
    }
    
    // Delete the participant
    const participantIndex = mockParticipants.findIndex(p => p.id === participant.id);
    if (participantIndex !== -1) {
      mockParticipants.splice(participantIndex, 1);
    }
    
    toast({
      title: "Teilnehmer gelöscht",
      description: `${participant.firstName} ${participant.lastName} wurde erfolgreich gelöscht.`
    });
    
    onOpenChange(false);
    onDeleted();
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teilnehmer löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie {participant?.firstName} {participant?.lastName} löschen möchten?
            {participant?.groupIds && participant?.groupIds.length > 0 && (
              <p className="mt-2">
                <b>Achtung:</b> Dieser Teilnehmer ist in {participant.groupIds.length} Gruppe(n). 
                Beim Löschen wird der Teilnehmer aus allen Gruppen entfernt.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteParticipantDialog;
