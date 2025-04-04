
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const NoActiveTournamentAlert: React.FC = () => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Kein aktives Turnier</AlertTitle>
      <AlertDescription>
        Bitte wählen Sie unter Administration → Turnierverwaltung ein aktives Turnier aus, bevor Sie Teilnehmer erfassen.
      </AlertDescription>
    </Alert>
  );
};

export default NoActiveTournamentAlert;
