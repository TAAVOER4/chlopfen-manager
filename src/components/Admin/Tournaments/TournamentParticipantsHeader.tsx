
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tournament } from '@/types';

interface TournamentParticipantsHeaderProps {
  tournament: Tournament | null;
}

const TournamentParticipantsHeader: React.FC<TournamentParticipantsHeaderProps> = ({ tournament }) => {
  return (
    <div className="mb-6">
      <Button variant="link" asChild className="px-0">
        <Link to="/admin/tournament">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Turnierverwaltung
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-swiss-blue mt-2">
        Teilnehmer zuweisen
      </h1>
      {tournament && (
        <p className="text-muted-foreground">
          {tournament.name} - {tournament.location}
        </p>
      )}
    </div>
  );
};

export default TournamentParticipantsHeader;
