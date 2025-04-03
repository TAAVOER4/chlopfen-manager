
import { useState, useEffect } from 'react';
import { User, CriterionKey, GroupCriterionKey } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';
import { hashPassword } from '@/utils/authUtils';

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Initializing and fetching users...');
      
      // First make sure we have the default admin user
      await SupabaseService.initializeUsers();
      
      // Then load all users
      const loadedUsers = await SupabaseService.getAllUsers();
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
      await SupabaseService.changePassword(user.username, newPassword);
      
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

  const handleSave = async () => {
    if (!editingUser) return;
    
    // Validate required fields
    if (!editingUser.name || !editingUser.username) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Name und Benutzername).",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure username has email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.username)) {
      toast({
        title: "Fehler",
        description: "Der Benutzername muss eine gültige E-Mail-Adresse sein.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const isNewUser = !users.some(u => u.id === editingUser.id);
      
      // Ensure new users have a password
      if (isNewUser && !editingUser.passwordHash) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie ein Passwort für den neuen Benutzer ein.",
          variant: "destructive"
        });
        return;
      }
      
      let updatedUser: User;
      
      if (isNewUser) {
        // For new users, we need to remove the temporary ID before sending to API
        const { id, ...userWithoutId } = editingUser;
        updatedUser = await SupabaseService.createUser(userWithoutId);
      } else {
        updatedUser = await SupabaseService.updateUser(editingUser);
      }
      
      setUsers(prevUsers => 
        isNewUser 
          ? [...prevUsers, updatedUser] 
          : prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );
      
      setEditingUser(null);
      
      toast({
        title: isNewUser ? "Benutzer erstellt" : "Benutzer aktualisiert",
        description: `Daten für ${updatedUser.name} wurden gespeichert.`
      });
    } catch (error) {
      console.error('Fehler beim Speichern des Benutzers:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern des Benutzers ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async () => {
    try {
      // New users start with an empty password that must be set during creation
      
      // Create a temporary new user with default values
      const newUser: User = {
        id: Math.floor(Math.random() * 1000),
        name: '',
        username: '',
        role: 'judge',
        passwordHash: '', // Empty password hash that must be set
        assignedCriteria: {
          individual: undefined,
          group: undefined
        },
        tournamentIds: []
      };
      
      setEditingUser(newUser);
      
      toast({
        title: "Neuer Benutzer",
        description: "Bitte vervollständigen Sie die Daten des neuen Benutzers."
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers:', error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Benutzers ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      await SupabaseService.deleteUser(user.username);
      
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      toast({
        title: "Fehler",
        description: "Beim Löschen des Benutzers ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return {
    users,
    loading,
    editingUser,
    userToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEdit,
    handleUserChange,
    handlePasswordChange,
    handleSave,
    handleAddUser,
    handleDeleteClick,
    handleDeleteUser
  };
};
