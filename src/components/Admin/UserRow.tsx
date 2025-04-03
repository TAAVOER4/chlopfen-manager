
import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from "@/components/ui/table";
import { User, CriterionKey, GroupCriterionKey, Tournament } from '@/types';
import UserForm from './UserForm';
import JudgeDisplay from './JudgeDisplay';
import UserPasswordDialog from './UserPasswordDialog';
import UserRoleBadge from './UserRoleBadge';
import UserTournaments from './UserTournaments';
import UserRowActions from './UserRowActions';

interface UserRowProps {
  user: User;
  editingUser: User | null;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: number) => void;
  onDeleteClick: (user: User) => void;
  onUserChange: (user: User) => void;
  onPasswordChange: (userId: number, newPassword: string) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
  tournaments: Tournament[];
  displayTournaments?: boolean;
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
  groupCriteria,
  tournaments,
  displayTournaments = false
}) => {
  const isEditing = editingUser?.id === user.id;
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Create maps for quick lookup
  const individualCriteriaMap = Object.fromEntries(
    individualCriteria.map(c => [c.value, c.label])
  );
  
  const groupCriteriaMap = Object.fromEntries(
    groupCriteria.map(c => [c.value, c.label])
  );

  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = (newPassword: string) => {
    onPasswordChange(user.id, newPassword);
  };

  return (
    <>
      <TableRow>
        <TableCell colSpan={isEditing ? 7 : undefined}>
          {isEditing ? (
            <div className="py-4">
              <UserForm 
                user={editingUser}
                onUserChange={onUserChange}
                individualCriteria={individualCriteria}
                groupCriteria={groupCriteria}
                tournaments={tournaments}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={onSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          ) : (
            user.name
          )}
        </TableCell>
        
        {!isEditing && (
          <>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              <UserRoleBadge role={user.role} />
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
              {user.role === 'judge' ? (
                <JudgeDisplay 
                  judge={user}
                  individualCriteriaMap={individualCriteriaMap}
                  groupCriteriaMap={groupCriteriaMap}
                />
              ) : null}
            </TableCell>
            <TableCell>
              {(user.role === 'reader' || user.role === 'editor') && displayTournaments ? (
                <UserTournaments 
                  tournamentIds={user.tournamentIds || []} 
                  tournaments={tournaments}
                  role={user.role}
                />
              ) : (
                <span className="text-muted-foreground text-sm">
                  {(user.role === 'admin' || user.role === 'judge') ? 'Alle Turniere' : ''}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <UserRowActions
                user={user}
                isEditing={isEditing}
                onEdit={onEdit}
                onSave={onSave}
                onImpersonate={onImpersonate}
                onDeleteClick={onDeleteClick}
                onPasswordDialogOpen={handlePasswordDialogOpen}
              />
            </TableCell>
          </>
        )}
      </TableRow>

      <UserPasswordDialog
        userName={user.name}
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onPasswordChange={handlePasswordSubmit}
      />
    </>
  );
};

export default UserRow;
