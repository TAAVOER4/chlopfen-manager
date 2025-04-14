
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/user/UserService';

export const useUserEditing = () => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleEdit = (user: User) => {
    // Don't allow editing the default admin
    if (user.id === '00000000-0000-4000-a000-000000000001' && user.role === 'admin') {
      toast({
        title: "Aktion nicht erlaubt",
        description: "Der Hauptadministrator kann nicht bearbeitet werden.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingUser({...user});
  };

  const handleUserChange = (updatedUser: User) => {
    setEditingUser(updatedUser);
  };

  const handlePasswordChange = async (userId: string, newPassword: string): Promise<boolean> => {
    setIsChangingPassword(true);
    try {
      // Find the user by ID
      if (!editingUser || userId !== editingUser.id) {
        throw new Error('User not found');
      }
      
      const result = await UserService.changePassword(editingUser.username, newPassword);
      
      if (result) {
        toast({
          title: "Passwort aktualisiert",
          description: "Das Passwort wurde erfolgreich aktualisiert."
        });
        return true;
      } else {
        toast({
          title: "Fehler beim Aktualisieren",
          description: "Das Passwort konnte nicht aktualisiert werden.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Fehler beim Aktualisieren",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    editingUser,
    handleEdit,
    handleUserChange,
    handlePasswordChange,
    isChangingPassword
  };
};
