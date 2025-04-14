
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { UserService } from '@/services/user/UserService';
import { useToast } from '@/hooks/use-toast';

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createUserMutation = useMutation({
    mutationFn: async (user: User): Promise<User | null> => {
      // Make sure we have a UUID
      if (!user.id) {
        user.id = crypto.randomUUID();
      }
      
      return await UserService.createUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Benutzer erstellt",
        description: "Der Benutzer wurde erfolgreich erstellt."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Der Benutzer konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (user: User): Promise<User | null> => {
      return await UserService.updateUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Benutzer aktualisiert",
        description: "Der Benutzer wurde erfolgreich aktualisiert."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message || "Der Benutzer konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (username: string): Promise<void> => {
      await UserService.deleteUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Der Benutzer konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string, password: string }): Promise<boolean> => {
      return await UserService.changePassword(username, password);
    },
    onSuccess: () => {
      toast({
        title: "Passwort aktualisiert",
        description: "Das Passwort wurde erfolgreich aktualisiert."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message || "Das Passwort konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  });

  return {
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending
  };
};
