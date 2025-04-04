
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Lade Daten...</p>
      </div>
    </div>
  );
};

export default LoadingState;
