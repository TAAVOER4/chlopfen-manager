
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/UserService';

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

  const handleSave = async () => {
    if (!editingUser) return;
    
    try {
      const result = await UserService.updateUser(editingUser);
      
      if (result) {
        toast({
          title: "Benutzer aktualisiert",
          description: "Die Benutzerinformationen wurden aktualisiert."
        });
        setEditingUser(null);
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Benutzerinformationen konnten nicht aktualisiert werden.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = () => {
    // Create a new user with default values
    const newUser: User = {
      id: crypto.randomUUID(), // Generate a UUID for new users
      name: '',
      username: '',
      role: 'judge',
      passwordHash: '',
      password: '',
      assignedCriteria: {
        individual: undefined,
        group: undefined
      },
      tournamentIds: []
    };
    
    setEditingUser(newUser);
  };

  const handlePasswordChange = async (userId: string, newPassword: string): Promise<boolean> => {
    setIsChangingPassword(true);
    try {
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        toast({
          title: "Benutzer nicht gefunden",
          description: "Der Benutzer konnte nicht gefunden werden.",
          variant: "destructive"
        });
        return false;
      }
      
      const result = await UserService.updatePassword(userId, newPassword);
      
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
    handleSave,
    handleAddUser,
    handlePasswordChange,
    isChangingPassword
  };
};
