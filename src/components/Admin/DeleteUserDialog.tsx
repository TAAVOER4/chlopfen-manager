
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
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onDelete: (userId: number) => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onDelete
}) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (!user) return;
    
    onDelete(user.id);
    onOpenChange(false);
    
    toast({
      title: "Benutzer gelöscht",
      description: `${user.name} wurde erfolgreich gelöscht.`
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzer löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie {user.name} löschen möchten?
            {user.role === 'admin' && (
              <p className="mt-2 text-destructive font-medium">
                Achtung: Dieser Benutzer ist ein Administrator.
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

export default DeleteUserDialog;
