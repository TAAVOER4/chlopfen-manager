
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScheduleItem } from '@/types';

interface DeleteScheduleItemDialogProps {
  currentItem: ScheduleItem | null;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

const DeleteScheduleItemDialog: React.FC<DeleteScheduleItemDialogProps> = ({
  currentItem,
  onConfirmDelete,
  onCancel
}) => {
  if (!currentItem) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Zeitplan-Eintrag löschen</DialogTitle>
        <DialogDescription>
          Sind Sie sicher, dass Sie diesen Zeitplan-Eintrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <p className="font-medium">{currentItem.title}</p>
        <p className="text-sm text-muted-foreground">
          {currentItem.startTime} - {currentItem.endTime}
        </p>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button variant="destructive" onClick={onConfirmDelete}>
          Löschen
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteScheduleItemDialog;
