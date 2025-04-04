
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types';
import { DatabaseService } from '@/services/DatabaseService';
import { Spinner } from '@/components/ui/spinner';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!participant) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the participant from the database
      await DatabaseService.deleteParticipant(participant.id);
      
      toast({
        title: "Teilnehmer gelöscht",
        description: `${participant.firstName} ${participant.lastName} wurde erfolgreich gelöscht.`
      });
      
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error('Error deleting participant:', error);
      toast({
        title: "Fehler",
        description: "Beim Löschen des Teilnehmers ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teilnehmer löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie {participant.firstName} {participant.lastName} löschen möchten?
            {participant.groupIds && participant.groupIds.length > 0 && (
              <p className="mt-2">
                <b>Achtung:</b> Dieser Teilnehmer ist in {participant.groupIds.length} Gruppe(n). 
                Beim Löschen wird der Teilnehmer aus allen Gruppen entfernt.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner size="small" className="mr-2" />
                Löschen...
              </>
            ) : (
              'Löschen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteParticipantDialog;
