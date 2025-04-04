
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group, Participant } from '@/types';

interface GroupsListProps {
  groups: Group[];
  activeTournamentId?: number;
  activeTournamentName?: string;
  participants: Participant[];
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  activeTournamentId,
  activeTournamentName,
  participants
}) => {
  const navigate = useNavigate();
  const tournamentGroups = groups.filter(g => g.tournamentId === activeTournamentId);

  return (
    <div className="bg-white rounded-lg border p-8 min-h-[300px] flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold mb-4">Gruppenübersicht</h3>
      {tournamentGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {tournamentGroups.map(group => (
            <div 
              key={group.id} 
              className="border rounded-md p-4 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">{group.name}</h4>
                  <Badge variant="outline" className="mt-1">
                    {group.category === 'kids_juniors' ? 'Kinder/Junioren' : 'Aktive'}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/participants/edit-group/${group.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {group.participantIds.length} Teilnehmer
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.participantIds.slice(0, 3).map(participantId => {
                    const participant = participants.find(p => p.id === participantId);
                    return participant ? (
                      <Badge key={participantId} variant="secondary" className="text-xs">
                        {participant.firstName} {participant.lastName}
                      </Badge>
                    ) : null;
                  })}
                  {group.participantIds.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{group.participantIds.length - 3} weitere
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Keine Gruppen für {activeTournamentName} gefunden.
          </p>
          <Button onClick={() => navigate('/participants/register-group')}>
            <Plus className="h-4 w-4 mr-2" />
            Gruppe erstellen
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupsList;
