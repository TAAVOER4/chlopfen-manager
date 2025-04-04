
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';

export const useUserMutations = (
  users: User[], 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  editingUser: User | null,
  setEditingUser: (user: User | null) => void
) => {
  const { toast } = useToast();

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
      if (isNewUser && !editingUser.password) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie ein Passwort für den neuen Benutzer ein.",
          variant: "destructive"
        });
        return;
      }
      
      // Log user data before sending to API for debugging
      console.log('Saving user with tournament IDs:', editingUser.tournamentIds);
      
      let updatedUser: User;
      
      if (isNewUser) {
        // For new users, we need to remove the temporary ID before sending to API
        const { id, ...userWithoutId } = editingUser;
        updatedUser = await SupabaseService.createUser(userWithoutId);
      } else {
        updatedUser = await SupabaseService.updateUser(editingUser);
      }
      
      console.log('User saved successfully:', updatedUser);
      
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

  const handleAddUser = () => {
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

  return {
    handleSave,
    handleAddUser
  };
};
