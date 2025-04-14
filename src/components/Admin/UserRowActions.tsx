
import React from 'react';
import { Edit, Trash, UserCheck, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { MoreHorizontal } from 'lucide-react';

interface UserRowActionsProps {
  user: User;
  isEditing: boolean;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: string) => void; // Changed from number to string
  onDeleteClick: (user: User) => void;
  onPasswordDialogOpen: () => void;
}

const UserRowActions: React.FC<UserRowActionsProps> = ({
  user,
  isEditing,
  onEdit,
  onSave,
  onImpersonate,
  onDeleteClick,
  onPasswordDialogOpen
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4 mr-2" />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onImpersonate(user.id)}>
          <UserCheck className="h-4 w-4 mr-2" />
          Als dieser Benutzer anmelden
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPasswordDialogOpen}>
          <Key className="h-4 w-4 mr-2" />
          Passwort ändern
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDeleteClick(user)}
          className="text-destructive"
        >
          <Trash className="h-4 w-4 mr-2" />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserRowActions;
