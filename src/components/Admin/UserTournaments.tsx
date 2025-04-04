
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tournament } from '@/types';

interface UserTournamentsProps {
  tournamentIds: number[];
  tournaments: Tournament[];
  role: string;
}

const UserTournaments: React.FC<UserTournamentsProps> = ({ 
  tournamentIds, 
  tournaments,
  role 
}) => {
  // Get tournament names for display
  const userTournaments = tournaments
    .filter(t => tournamentIds?.includes(t.id))
    .map(t => t.name);

  // Admin and judge roles have access to all tournaments by default
  if (role === 'admin') {
    return (
      <span className="text-muted-foreground text-sm">Alle Turniere</span>
    );
  }

  // Display assigned tournaments for all other roles
  if (userTournaments.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {userTournaments.map((name, index) => (
          <Badge key={index} variant="outline">{name}</Badge>
        ))}
      </div>
    );
  }

  // No tournaments assigned
  return (
    <span className="text-yellow-600 text-sm">Keine Turniere zugewiesen</span>
  );
};

export default UserTournaments;
