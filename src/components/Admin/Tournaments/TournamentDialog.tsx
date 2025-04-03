
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TournamentForm, { TournamentFormValues } from './TournamentForm';

interface TournamentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TournamentFormValues) => void;
  isEditing: boolean;
  defaultValues?: TournamentFormValues;
}

const TournamentDialog: React.FC<TournamentDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isEditing,
  defaultValues,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Turnier bearbeiten' : 'Neues Turnier erstellen'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Bearbeiten Sie die Turnierdetails unten.' : 'Geben Sie die Turnierdetails unten ein.'}
          </DialogDescription>
        </DialogHeader>
        <TournamentForm 
          onSubmit={onSubmit}
          isEditing={isEditing}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDialog;
