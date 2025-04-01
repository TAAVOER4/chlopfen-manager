
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
import { Judge } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DeleteJudgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  judge: Judge | null;
  onDelete: (judgeId: string) => void;
}

const DeleteJudgeDialog: React.FC<DeleteJudgeDialogProps> = ({
  open,
  onOpenChange,
  judge,
  onDelete
}) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (!judge) return;
    
    onDelete(judge.id);
    onOpenChange(false);
    
    toast({
      title: "Richter gelöscht",
      description: `${judge.name} wurde erfolgreich gelöscht.`
    });
  };

  if (!judge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Richter löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie {judge.name} löschen möchten?
            {judge.role === 'admin' && (
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

export default DeleteJudgeDialog;
