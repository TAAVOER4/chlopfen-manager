
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParticipantsHeaderProps {
  activeTournament: { id: number; name: string } | null;
}

const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({ activeTournament }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer</h1>
      <div className="flex space-x-3 mt-4 md:mt-0">
        <Button 
          onClick={() => navigate('/participants/register')}
          disabled={!activeTournament}
        >
          <Plus className="h-4 w-4 mr-2" />
          Teilnehmer erfassen
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/participants/register-group')}
          disabled={!activeTournament}
        >
          <Plus className="h-4 w-4 mr-2" />
          Gruppe erfassen
        </Button>
      </div>
    </div>
  );
};

export default ParticipantsHeader;
