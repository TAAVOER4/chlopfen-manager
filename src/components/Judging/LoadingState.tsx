
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Spinner size="large" />
      <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
    </div>
  );
};

export default LoadingState;
