
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/UserService';

export const useUserEditing = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleUserChange = (updatedUser: User) => {
    setEditingUser(updatedUser);
  };

  const handlePasswordChange = async (userId: number, newPassword: string) => {
    try {
      setIsChangingPassword(true);
      
      // Find the user in our local state
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      console.log('Attempting to change password for user:', user.username);
      
      // Use the dedicated service for password changes
      const success = await UserService.changePassword(user.username, newPassword);
      
      if (success) {
        toast({
          title: "Passwort geändert",
          description: "Das Passwort wurde erfolgreich geändert."
        });
      } else {
        console.error('Password change failed');
        throw new Error('Password update failed');
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      toast({
        title: "Fehler",
        description: "Beim Ändern des Passworts ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    editingUser,
    setEditingUser,
    handleEdit,
    handleUserChange,
    handlePasswordChange,
    isChangingPassword
  };
};
