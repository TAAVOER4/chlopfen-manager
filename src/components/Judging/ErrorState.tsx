
import React from 'react';

const ErrorState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4 text-destructive">Fehler beim Laden der Teilnehmer</h2>
      <p className="text-muted-foreground mb-4">Bitte versuchen Sie es später erneut.</p>
    </div>
  );
};

export default ErrorState;
