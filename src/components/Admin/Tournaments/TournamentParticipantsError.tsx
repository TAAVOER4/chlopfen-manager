
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface TournamentParticipantsErrorProps {
  isLoading?: boolean;
  hasError?: boolean;
  tournamentNotFound?: boolean;
}

const TournamentParticipantsError: React.FC<TournamentParticipantsErrorProps> = ({
  isLoading,
  hasError,
  tournamentNotFound
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Fehler beim Laden der Teilnehmer</h2>
        <Button asChild>
          <Link to="/admin/tournament">Zurück zur Turnierverwaltung</Link>
        </Button>
      </div>
    );
  }

  if (tournamentNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Turnier nicht gefunden</h2>
        <Button asChild>
          <Link to="/admin/tournament">Zurück zur Turnierverwaltung</Link>
        </Button>
      </div>
    );
  }

  return null;
};

export default TournamentParticipantsError;
