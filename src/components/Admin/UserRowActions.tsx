
import React from 'react';
import { Edit, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface UserRowActionsProps {
  user: User;
  isEditing: boolean;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: number) => void;
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
    <div className="flex justify-end gap-2">
      {isEditing ? (
        <Button size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
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
        </>
      )}
    </div>
  );
};

export default UserRowActions;
