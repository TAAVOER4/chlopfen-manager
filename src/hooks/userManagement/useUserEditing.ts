
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
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
      console.log('Attempting to change password for user:', user.username);
      
      // Pass plain password to service which will hash it before saving
      const success = await UserService.changePassword(user.username, newPassword);
      
      if (success) {
        toast({
          title: "Passwort geändert",
          description: "Das Passwort wurde erfolgreich geändert."
        });
      } else {
        console.error('Password change returned false');
        throw new Error('Password update failed');
      }
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
