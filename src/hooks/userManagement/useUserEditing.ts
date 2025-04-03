
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { hashPassword } from '@/utils/authUtils';
import { UserService } from '@/services/UserService';

export const useUserEditing = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleUserChange = (updatedUser: User) => {
    setEditingUser(updatedUser);
  };

  const handlePasswordChange = async (userId: number, newPassword: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      // Hash password before sending to API
      const passwordHash = hashPassword(newPassword);
      await UserService.changePassword(user.username, newPassword);
      
      setUsers(prevUsers => {
        return prevUsers.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              passwordHash: passwordHash
            };
          }
          return u;
        });
      });

      if (editingUser && editingUser.id === userId) {
        setEditingUser({
          ...editingUser,
          passwordHash: passwordHash
        });
      }
      
      toast({
        title: "Passwort geändert",
        description: "Das Passwort wurde erfolgreich geändert."
      });
    } catch (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      toast({
        title: "Fehler",
        description: "Beim Ändern des Passworts ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return {
    editingUser,
    setEditingUser,
    handleEdit,
    handleUserChange,
    handlePasswordChange
  };
};
