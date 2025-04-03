
import React, { useState } from 'react';
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

interface UserPasswordDialogProps {
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (newPassword: string) => void;
}

const UserPasswordDialog: React.FC<UserPasswordDialogProps> = ({ 
  userName, 
  open, 
  onOpenChange, 
  onPasswordChange 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    
    // Pass the plain password to the handler which will hash it
    onPasswordChange(newPassword);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
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
            />
          </div>
          {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handlePasswordSubmit}>
            Passwort ändern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPasswordDialog;
