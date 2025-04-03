
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tournament } from '@/types';

interface DeleteTournamentDialogProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteTournamentDialog: React.FC<DeleteTournamentDialogProps> = ({
  tournament,
  isOpen,
  onOpenChange,
  onConfirmDelete,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Turnier löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie dieses Turnier löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {tournament && (
            <p className="font-medium">{tournament.name}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button variant="destructive" onClick={onConfirmDelete}>Löschen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTournamentDialog;
