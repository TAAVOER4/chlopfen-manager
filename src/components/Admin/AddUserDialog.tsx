
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import UserForm from '@/components/Admin/UserForm';
import { User, CriterionKey, GroupCriterionKey, Tournament } from '@/types';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  user: User;
  onUserChange: (updatedUser: User) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
  tournaments: Tournament[];
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  user,
  onUserChange,
  individualCriteria,
  groupCriteria,
  tournaments
}) => {
  const handleSaveClick = () => {
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuer Benutzer</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Benutzer. Alle mit * markierten Felder sind Pflichtfelder.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <UserForm
            user={user}
            onUserChange={onUserChange}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
            tournaments={tournaments}
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSaveClick}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
