
import { useUserLoading } from './useUserLoading';
import { useUserEditing } from './useUserEditing';
import { useUserDeletion } from './useUserDeletion';
import { useUserMutations } from './useUserMutations';

export const useUserManagement = () => {
  // Load users
  const { users, loading, loadUsers } = useUserLoading();
  
  // User editing operations
  const { editingUser, handleEdit, handleUserChange, handlePasswordChange, isChangingPassword } = 
    useUserEditing();
  
  // User deletion operations
  const { userToDelete, deleteDialogOpen, setDeleteDialogOpen, handleDeleteClick, handleDeleteUser } = 
    useUserDeletion();
  
  // User mutation operations (create/update)
  const { createUser, updateUser, isCreating, isUpdating } = 
    useUserMutations();

  const handleSave = () => {
    if (editingUser) {
      updateUser(editingUser);
    }
  };

  const handleAddUser = () => {
    handleEdit({
      id: crypto.randomUUID(),
      name: '',
      username: '',
      role: 'judge',
      passwordHash: '',
      password: '',
      assignedCriteria: {
        individual: undefined,
        group: undefined
      },
      tournamentIds: []
    });
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
    handleDeleteUser,
    isChangingPassword
  };
};

// Re-export all hooks for direct imports when needed
export * from './useUserLoading';
export * from './useUserEditing';
export * from './useUserDeletion';
export * from './useUserMutations';
