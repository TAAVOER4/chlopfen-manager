
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5 max-w-lg mx-auto mt-8">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
      <p className="mb-4 text-center">Die angeforderte Gruppe konnte nicht gefunden werden. Möglicherweise wurde sie gelöscht oder die ID ist ungültig.</p>
      <Button onClick={() => navigate('/participants')}>
        Zurück zur Übersicht
      </Button>
    </div>
  );
};

export default NotFoundState;
