
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/UserService';
import { SupabaseService } from '@/services/SupabaseService';

export const useUserLoading = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Initializing and fetching users...');
      
      // First make sure we have the default admin user
      await SupabaseService.initializeUsers();
      
      // Then load all users
      const loadedUsers = await UserService.getAllUsers();
      console.log('Loaded users:', loadedUsers);
      
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      toast({
        title: "Fehler",
        description: "Beim Laden der Benutzer ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    setUsers,
    loading,
    loadUsers
  };
};
