
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
      <p className="mb-4">Die angeforderte Gruppe konnte nicht gefunden werden.</p>
      <Button onClick={() => navigate('/participants')}>
        Zurück zur Übersicht
      </Button>
    </div>
  );
};

export default NotFoundState;
