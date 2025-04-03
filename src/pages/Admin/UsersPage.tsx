
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
  
  // Benutzer laden
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Zuerst prüfen, ob Standardbenutzer hinzugefügt werden müssen
        await SupabaseService.initializeUsers();
        
        // Dann alle Benutzer laden
        const loadedUsers = await SupabaseService.getAllUsers();
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
  
  // Available criteria for assignment
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

  // Filter users based on active role tab
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
      // Passwort in Supabase aktualisieren
      await SupabaseService.changePassword(user.username, newPassword);
      
      // Lokalen Status aktualisieren
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
    if (editingUser) {
      try {
        // Benutzer in Supabase aktualisieren
        const updatedUser = await SupabaseService.updateUser(editingUser);
        
        // Lokalen Status aktualisieren
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        
        setEditingUser(null);
        
        toast({
          title: "Benutzer aktualisiert",
          description: `Daten für ${updatedUser.name} wurden gespeichert.`
        });
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzers:', error);
        toast({
          title: "Fehler",
          description: "Beim Aktualisieren des Benutzers ist ein Fehler aufgetreten.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddUser = async () => {
    try {
      // Default password is "password"
      const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
      
      const newUser = {
        name: 'Neuer Benutzer',
        username: `neuer.benutzer.${Date.now()}`, // Einzigartiger Benutzername
        role: 'judge' as UserRole,
        passwordHash: defaultPasswordHash,
        assignedCriteria: {
          individual: 'rhythm' as CriterionKey
        },
        tournamentIds: []
      };
      
      // Benutzer in Supabase erstellen
      const createdUser = await SupabaseService.createUser(newUser);
      
      // Lokalen Status aktualisieren
      setUsers(prevUsers => [...prevUsers, createdUser]);
      setEditingUser(createdUser);
      
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
      // Benutzer in Supabase löschen
      await SupabaseService.deleteUser(user.username);
      
      // Lokalen Status aktualisieren
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
              <Spinner size="lg" />
              <span className="ml-2 text-muted-foreground">Benutzer werden geladen...</span>
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
