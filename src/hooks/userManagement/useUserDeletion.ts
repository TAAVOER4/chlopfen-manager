
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/user/UserService';

export const useUserDeletion = () => {
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (user: User) => {
    if (user.id === '00000000-0000-4000-a000-000000000001') {
      toast({
        title: "Aktion nicht erlaubt",
        description: "Der Hauptadministrator kann nicht gelöscht werden.",
        variant: "destructive"
      });
      return;
    }
    
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === '00000000-0000-4000-a000-000000000001') {
      toast({
        title: "Aktion nicht erlaubt",
        description: "Der Hauptadministrator kann nicht gelöscht werden.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      // Make sure to use the username, not the ID - this is to match the existing UserService interface
      const userToBeDeleted = userToDelete;
      if (!userToBeDeleted) {
        throw new Error('No user selected for deletion');
      }
      
      await UserService.deleteUser(userToBeDeleted.username);
      
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Benutzer konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return {
    userToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteClick,
    handleDeleteUser,
    isDeleting
  };
};
