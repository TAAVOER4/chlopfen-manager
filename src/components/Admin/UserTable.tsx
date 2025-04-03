
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, CriterionKey, GroupCriterionKey, Tournament } from '@/types'; 
import UserRow from './UserRow';

interface UserTableProps {
  users: User[];
  editingUser: User | null;
  onEdit: (user: User) => void;
  onSave: () => void;
  onImpersonate: (userId: number) => void;
  onDeleteClick: (user: User) => void;
  onUserChange: (user: User) => void;
  onPasswordChange: (userId: number, newPassword: string) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
  tournaments: Tournament[];
  displayTournaments?: boolean;
  isChangingPassword?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users,
  editingUser,
  onEdit,
  onSave,
  onImpersonate,
  onDeleteClick,
  onUserChange,
  onPasswordChange,
  individualCriteria,
  groupCriteria,
  tournaments,
  displayTournaments = false,
  isChangingPassword = false
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Benutzername</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Passwort</TableHead>
          <TableHead>Kriterien</TableHead>
          <TableHead>Turniere</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <UserRow
            key={user.id}
            user={user}
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
            displayTournaments={displayTournaments}
            isChangingPassword={isChangingPassword}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
