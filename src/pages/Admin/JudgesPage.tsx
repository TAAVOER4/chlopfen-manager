
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockJudges, updateMockJudges } from '@/data/mockJudges';
import { User, CriterionKey, GroupCriterionKey, UserRole } from '@/types';
import { useUser } from '@/contexts/UserContext';
import DeleteJudgeDialog from '@/components/Admin/DeleteJudgeDialog';
import UserTable from '@/components/Admin/UserTable';
import { hashPassword } from '@/utils/authUtils';

const UsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockJudges);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { impersonate } = useUser();
  
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

  const handlePasswordChange = (userId: number, newPassword: string) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            passwordHash: hashPassword(newPassword)
          };
        }
        return user;
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
  };

  const handleSave = () => {
    if (editingUser) {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? editingUser : u
      );
      
      setUsers(updatedUsers);
      // Update the mockJudges in the data file
      updateMockJudges(updatedUsers);
      setEditingUser(null);
      
      toast({
        title: "Benutzer aktualisiert",
        description: `Daten für ${editingUser.name} wurden gespeichert.`
      });
    }
  };

  const handleAddUser = () => {
    // Default password is "password"
    const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
    
    // Generate a new ID (highest existing ID + 1)
    const newId = Math.max(...users.map(user => user.id), 0) + 1;
    
    const newUser: User = {
      id: newId,
      name: 'Neuer Benutzer',
      username: 'neuer.benutzer',
      role: 'judge' as UserRole,
      passwordHash: defaultPasswordHash,
      assignedCriteria: {
        individual: 'rhythm'
      }
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    // Update the mockJudges in the data file
    updateMockJudges(updatedUsers);
    setEditingUser(newUser);
    
    toast({
      title: "Neuer Benutzer",
      description: "Bitte vervollständigen Sie die Daten des neuen Benutzers."
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    // Update the mockJudges in the data file
    updateMockJudges(updatedUsers);
    
    toast({
      title: "Benutzer gelöscht",
      description: "Der Benutzer wurde erfolgreich gelöscht."
    });
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
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Benutzer und Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            editingUser={editingUser}
            onEdit={handleEdit}
            onSave={handleSave}
            onImpersonate={handleImpersonate}
            onDeleteClick={handleDeleteClick}
            onUserChange={handleUserChange}
            onPasswordChange={handlePasswordChange}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
          />
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Zurück
          </Button>
        </CardFooter>
      </Card>
      
      <DeleteJudgeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        judge={userToDelete}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UsersPage;
