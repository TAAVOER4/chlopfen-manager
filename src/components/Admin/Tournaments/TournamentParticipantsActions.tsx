
import React from 'react';
import { Button } from '@/components/ui/button';

interface TournamentParticipantsActionsProps {
  assignAll: () => void;
  unassignAll: () => void;
  saveAssignments: () => void;
}

const TournamentParticipantsActions: React.FC<TournamentParticipantsActionsProps> = ({
  assignAll,
  unassignAll,
  saveAssignments
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={assignAll}>
        Alle zuweisen
      </Button>
      <Button variant="outline" onClick={unassignAll}>
        Alle entfernen
      </Button>
      <Button onClick={saveAssignments}>
        Änderungen speichern
      </Button>
    </div>
  );
};

export default TournamentParticipantsActions;
