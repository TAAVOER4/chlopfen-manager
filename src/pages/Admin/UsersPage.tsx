
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import DeleteUserDialog from '@/components/Admin/DeleteUserDialog';
import AddUserDialog from '@/components/Admin/AddUserDialog';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserCriteriaData } from '@/hooks/useUserCriteriaData';
import UserFilterTabs from '@/components/Admin/UserFilterTabs';
import UserListContent from '@/components/Admin/UserListContent';

const UsersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { impersonate } = useUser();
  const { 
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
  } = useUserManagement();
  
  const { individualCriteria, groupCriteria, tournaments } = useUserCriteriaData();

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

  const handleAddButtonClick = () => {
    handleAddUser();
    setAddDialogOpen(true);
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
        <Button onClick={handleAddButtonClick}>
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
            
            <UserFilterTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              users={users}
            />
          </div>
        </CardHeader>
        <CardContent>
          <UserListContent
            loading={loading}
            users={users}
            filteredUsers={filteredUsers}
            editingUser={editingUser}
            onEdit={handleEdit}
            onSave={handleSave}
            onImpersonate={handleImpersonate}
            onDeleteClick={handleDeleteClick}
            onUserChange={handleUserChange}
            onPasswordChange={handlePasswordChange}
            onAddUser={handleAddButtonClick}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
            tournaments={tournaments}
          />
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

      {editingUser && (
        <AddUserDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSave={handleSave}
          user={editingUser}
          onUserChange={handleUserChange}
          individualCriteria={individualCriteria}
          groupCriteria={groupCriteria}
          tournaments={tournaments}
        />
      )}
    </div>
  );
};

export default UsersPage;
