
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

interface EmptyUserStateProps {
  onAddUser: () => void;
}

const EmptyUserState: React.FC<EmptyUserStateProps> = ({ onAddUser }) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center">
      <div className="text-muted-foreground mb-4">
        <Users className="h-12 w-12 mx-auto mb-2" />
        <p>Keine Benutzer gefunden.</p>
      </div>
      <Button onClick={onAddUser}>
        <UserPlus className="h-4 w-4 mr-2" />
        Benutzer hinzufügen
      </Button>
    </div>
  );
};

export default EmptyUserState;
