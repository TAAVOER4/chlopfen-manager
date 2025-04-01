
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, CriterionKey, GroupCriterionKey } from '@/types';
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
  groupCriteria
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Benutzername</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Passwort</TableHead>
          <TableHead>Zugewiesene Kriterien</TableHead>
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
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
