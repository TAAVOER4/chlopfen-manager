
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { User, CriterionKey, GroupCriterionKey, Tournament } from '@/types';
import UserTable from './UserTable';
import EmptyUserState from './EmptyUserState';

interface UserListContentProps {
  loading: boolean;
  users: User[];
  filteredUsers: User[];
  editingUser: User | null;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: number) => void;
  onDeleteClick: (user: User) => void;
  onUserChange: (user: User) => void;
  onPasswordChange: (userId: number, newPassword: string) => Promise<boolean>;
  onAddUser: () => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
  tournaments: Tournament[];
  isChangingPassword?: boolean;
}

const UserListContent: React.FC<UserListContentProps> = ({
  loading,
  users,
  filteredUsers,
  editingUser,
  onEdit,
  onSave,
  onImpersonate,
  onDeleteClick,
  onUserChange,
  onPasswordChange,
  onAddUser,
  individualCriteria,
  groupCriteria,
  tournaments,
  isChangingPassword = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="large" />
        <span className="ml-2 text-muted-foreground">Benutzer werden geladen...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return <EmptyUserState onAddUser={onAddUser} />;
  }

  return (
    <UserTable
      users={filteredUsers}
      editingUser={editingUser}
      onEdit={onEdit}
      onSave={onSave}
      onImpersonate={onImpersonate}
      onDeleteClick={onDeleteClick}
      onUserChange={onUserChange}
      onPasswordChange={onPasswordChange}
      individualCriteria={individualCriteria}
      groupCriteria={groupCriteria}
      tournaments={tournaments}
      displayTournaments={true}
      isChangingPassword={isChangingPassword}
    />
  );
};

export default UserListContent;
