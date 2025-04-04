
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from 'lucide-react';
import { Button } from '@/components/ui';
import { Group } from '@/types';

interface EditGroupHeaderProps {
  group: Group;
  onDeleteClick: () => void;
}

const EditGroupHeader: React.FC<EditGroupHeaderProps> = ({ group, onDeleteClick }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">
          Gruppe bearbeiten: {group.name}
        </h1>
      </div>
      <Button 
        variant="destructive" 
        onClick={onDeleteClick}
      >
        <Trash className="h-4 w-4 mr-2" />
        Gruppe löschen
      </Button>
    </div>
  );
};

export default EditGroupHeader;
