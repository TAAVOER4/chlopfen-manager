
import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface UserPasswordDialogProps {
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (newPassword: string) => Promise<boolean>;
  isLoading?: boolean;
}

const UserPasswordDialog: React.FC<UserPasswordDialogProps> = ({ 
  userName, 
  open, 
  onOpenChange, 
  onPasswordChange,
  isLoading = false
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setInternalLoading(true);
    
    try {
      const success = await onPasswordChange(newPassword);
      
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const resetForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // Use either the prop loading state or our internal loading state
  const isCurrentlyLoading = isLoading || internalLoading;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      if (!isCurrentlyLoading) onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passwort ändern</DialogTitle>
          <DialogDescription>
            Geben Sie ein neues Passwort für {userName} ein.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">Neues Passwort</Label>
            <Input 
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort"
              disabled={isCurrentlyLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Passwort bestätigen</Label>
            <Input 
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen"
              disabled={isCurrentlyLoading}
            />
          </div>
          {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCurrentlyLoading}>
            Abbrechen
          </Button>
          <Button onClick={handlePasswordSubmit} disabled={isCurrentlyLoading}>
            {isCurrentlyLoading ? (
              <>
                <Spinner size="small" className="mr-2" />
                Wird geändert...
              </>
            ) : (
              'Passwort ändern'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPasswordDialog;
