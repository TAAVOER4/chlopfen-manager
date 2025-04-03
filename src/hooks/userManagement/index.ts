
import { useUserLoading } from './useUserLoading';
import { useUserEditing } from './useUserEditing';
import { useUserDeletion } from './useUserDeletion';
import { useUserMutations } from './useUserMutations';

export const useUserManagement = () => {
  // Load users
  const { users, setUsers, loading, loadUsers } = useUserLoading();
  
  // User editing operations
  const { editingUser, setEditingUser, handleEdit, handleUserChange, handlePasswordChange } = 
    useUserEditing(users, setUsers);
  
  // User deletion operations
  const { userToDelete, deleteDialogOpen, setDeleteDialogOpen, handleDeleteClick, handleDeleteUser } = 
    useUserDeletion(users, setUsers);
  
  // User mutation operations (create/update)
  const { handleSave, handleAddUser } = 
    useUserMutations(users, setUsers, editingUser, setEditingUser);

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

// Re-export all hooks for direct imports when needed
export * from './useUserLoading';
export * from './useUserEditing';
export * from './useUserDeletion';
export * from './useUserMutations';
