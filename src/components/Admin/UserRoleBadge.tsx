
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

interface UserRoleBadgeProps {
  role: UserRole;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  // Helper function to display user role in German
  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'judge': return 'Richter';
      case 'reader': return 'Nur Lesen';
      case 'editor': return 'Bearbeiter';
      default: return role;
    }
  };

  const getBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'judge': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant(role)}>
      {getRoleName(role)}
    </Badge>
  );
};

export default UserRoleBadge;
