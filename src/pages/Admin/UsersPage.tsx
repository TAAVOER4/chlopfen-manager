
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users, Lock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { User, CriterionKey, GroupCriterionKey, UserRole, Tournament } from '@/types';
import { useUser } from '@/contexts/UserContext';
import DeleteUserDialog from '@/components/Admin/DeleteUserDialog';
import UserTable from '@/components/Admin/UserTable';
import { hashPassword } from '@/utils/authUtils';
import { SupabaseService } from '@/services/SupabaseService';
import { mockTournaments } from '@/data/mockTournaments';
import { Spinner } from '@/components/ui/spinner';

const UsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { impersonate } = useUser();
  
  useEffect(() => {
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
    
    loadUsers();
  }, [toast]);
  
  const individualCriteria: { value: CriterionKey; label: string }[] = [
    { value: 'whipStrikes', label: 'Schläge' },
    { value: 'rhythm', label: 'Rhythmus' },
    { value: 'stance', label: 'Stand' },
    { value: 'posture', label: 'Körperhaltung' },
    { value: 'whipControl', label: 'Geiselführung' },
  ];
  
  const groupCriteria: { value: GroupCriterionKey; label: string }[] = [
    { value: 'whipStrikes', label: 'Schläge (Gruppe)' },
    { value: 'rhythm', label: 'Rhythmus (Gruppe)' },
    { value: 'tempo', label: 'Takt (Gruppe)' },
  ];

  const tournaments: Tournament[] = mockTournaments;

  const filteredUsers = activeTab === "all" 
    ? users 
    : users.filter(user => user.role === activeTab);

  const handleImpersonate = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      impersonate(user);
      
      if (user.role === 'judge') {
        navigate('/judging');
      } else {
        navigate('/');
      }
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
      await SupabaseService.changePassword(user.username, newPassword);
      
      setUsers(prevUsers => {
        return prevUsers.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              passwordHash: hashPassword(newPassword)
            };
          }
          return u;
        });
      });

      if (editingUser && editingUser.id === userId) {
        setEditingUser({
          ...editingUser,
          passwordHash: hashPassword(newPassword)
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
    
    try {
      const isNewUser = !users.some(u => u.id === editingUser.id);
      
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
      const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
      
      // Create a temporary new user with default values
      const newUser: User = {
        id: Math.floor(Math.random() * 1000),
        name: '',
        username: '',
        role: 'judge' as UserRole,
        passwordHash: defaultPasswordHash,
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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-swiss-blue">Benutzerverwaltung</h1>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Neuer Benutzer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Benutzer und Berechtigungen
            </CardTitle>
            
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">
                    Alle <Badge variant="outline" className="ml-2">{users.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="admin">
                    Admins <Badge variant="outline" className="ml-2">
                      {users.filter(u => u.role === 'admin').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="judge">
                    Richter <Badge variant="outline" className="ml-2">
                      {users.filter(u => u.role === 'judge').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="reader">
                    Leser <Badge variant="outline" className="ml-2">
                      {users.filter(u => u.role === 'reader').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="editor">
                    Bearbeiter <Badge variant="outline" className="ml-2">
                      {users.filter(u => u.role === 'editor').length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="large" />
              <span className="ml-2 text-muted-foreground">Benutzer werden geladen...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-muted-foreground mb-4">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>Keine Benutzer gefunden.</p>
              </div>
              <Button onClick={handleAddUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Benutzer hinzufügen
              </Button>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              editingUser={editingUser}
              onEdit={handleEdit}
              onSave={handleSave}
              onImpersonate={handleImpersonate}
              onDeleteClick={handleDeleteClick}
              onUserChange={handleUserChange}
              onPasswordChange={handlePasswordChange}
              individualCriteria={individualCriteria}
              groupCriteria={groupCriteria}
              tournaments={tournaments}
              displayTournaments={true}
            />
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Zurück
          </Button>
        </CardFooter>
      </Card>
      
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UsersPage;
