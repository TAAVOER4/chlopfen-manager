
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size="large" className="mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Lade Gruppendaten...</p>
      </div>
    </div>
  );
};

export default LoadingState;
