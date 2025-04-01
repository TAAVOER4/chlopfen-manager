
import React, { useState } from 'react';
import { Edit, Save, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from "@/components/ui/table";
import { User, CriterionKey, GroupCriterionKey } from '@/types';
import UserForm from './UserForm';
import JudgeDisplay from './JudgeDisplay';
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

interface UserRowProps {
  user: User;
  editingUser: User | null;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: string) => void;
  onDeleteClick: (user: User) => void;
  onUserChange: (user: User) => void;
  onPasswordChange: (userId: string, newPassword: string) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const UserRow: React.FC<UserRowProps> = ({ 
  user, 
  editingUser, 
  onEdit, 
  onSave, 
  onImpersonate,
  onDeleteClick,
  onUserChange,
  onPasswordChange,
  individualCriteria,
  groupCriteria
}) => {
  const isEditing = editingUser?.id === user.id;
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Create maps for quick lookup
  const individualCriteriaMap = Object.fromEntries(
    individualCriteria.map(c => [c.value, c.label])
  );
  
  const groupCriteriaMap = Object.fromEntries(
    groupCriteria.map(c => [c.value, c.label])
  );

  const handlePasswordDialogOpen = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    
    onPasswordChange(user.id, newPassword);
    setPasswordDialogOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          {isEditing ? (
            <UserForm 
              user={editingUser}
              onUserChange={onUserChange}
              individualCriteria={individualCriteria}
              groupCriteria={groupCriteria}
            />
          ) : (
            user.name
          )}
        </TableCell>
        <TableCell>
          {isEditing ? null : user.username}
        </TableCell>
        <TableCell>
          {isEditing ? null : (user.role === 'admin' ? 'Administrator' : 'Richter')}
        </TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasswordDialogOpen}
          >
            <Key className="h-4 w-4 mr-2" />
            Passwort ändern
          </Button>
        </TableCell>
        <TableCell>
          {isEditing ? null : (
            <JudgeDisplay 
              judge={user}
              individualCriteriaMap={individualCriteriaMap}
              groupCriteriaMap={groupCriteriaMap}
            />
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            )}
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onImpersonate(user.id)}
            >
              Als Benutzer anmelden
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDeleteClick(user)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Geben Sie ein neues Passwort für {user.name} ein.
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
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Passwort ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserRow;
