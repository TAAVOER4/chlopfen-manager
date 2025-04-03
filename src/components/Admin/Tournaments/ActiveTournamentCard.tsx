
import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Map, Trophy, PenLine } from 'lucide-react';
import { Tournament } from '@/types';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActiveTournamentCardProps {
  tournament: Tournament;
  onEdit: (tournament: Tournament) => void;
  onParticipantAssignment: (tournamentId: number) => void;
  onJudgeAssignment: (tournamentId: number) => void;
}

const ActiveTournamentCard: React.FC<ActiveTournamentCardProps> = ({
  tournament,
  onEdit,
  onParticipantAssignment,
  onJudgeAssignment,
}) => {
  return (
    <Card className="mb-8 border-swiss-blue/50">
      <CardHeader className="bg-swiss-blue/5">
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-swiss-blue" />
          Aktives Turnier
        </CardTitle>
        <CardDescription>
          Das aktuell aktive Turnier für alle Funktionen
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{tournament.name}</h3>
            <p className="text-muted-foreground flex items-center mt-2">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(new Date(tournament.date), 'PPP', { locale: de })}
            </p>
            <p className="text-muted-foreground flex items-center mt-1">
              <Map className="h-4 w-4 mr-2" />
              {tournament.location}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onEdit(tournament)}>
              <PenLine className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button variant="outline" onClick={() => onParticipantAssignment(tournament.id)}>
              Teilnehmer zuweisen
            </Button>
            <Button variant="outline" onClick={() => onJudgeAssignment(tournament.id)}>
              Richter zuweisen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTournamentCard;
