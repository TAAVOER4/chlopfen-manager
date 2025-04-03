
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

  if (role === 'admin' || role === 'judge') {
    return (
      <span className="text-muted-foreground text-sm">Alle Turniere</span>
    );
  }

  if (userTournaments.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {userTournaments.map((name, index) => (
          <Badge key={index} variant="outline">{name}</Badge>
        ))}
      </div>
    );
  }

  return (
    <span className="text-yellow-600 text-sm">Keine Turniere zugewiesen</span>
  );
};

export default UserTournaments;
