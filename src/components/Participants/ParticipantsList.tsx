
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Participant, Group } from '@/types';

interface ParticipantsListProps {
  filteredParticipants: Participant[];
  tournamentParticipants: Participant[];
  activeTournamentName?: string;
  getGroupsForParticipant: (participantId: number) => Group[];
  onDeleteClick: (participant: Participant) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  filteredParticipants,
  tournamentParticipants,
  activeTournamentName,
  getGroupsForParticipant,
  onDeleteClick
}) => {
  const navigate = useNavigate();

  const handleEditParticipant = (participantId: number) => {
    navigate(`/participants/edit/${participantId}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Jahrgang</TableHead>
              <TableHead>Wohnort</TableHead>
              <TableHead>Gruppe(n)</TableHead>
              <TableHead>Teilnahme</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant) => {
                const participantGroups = getGroupsForParticipant(participant.id);
                return (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {participant.category === 'kids' ? 'Kinder' : 
                        participant.category === 'juniors' ? 'Junioren' : 'Aktive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{participant.birthYear}</TableCell>
                    <TableCell>{participant.location}</TableCell>
                    <TableCell>
                      {participantGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {participantGroups.map(group => (
                            <Badge 
                              key={group.id} 
                              variant="secondary"
                              className="text-xs"
                            >
                              {group.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.isGroupOnly ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Nur Gruppe
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Einzel & Gruppe
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditParticipant(participant.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteClick(participant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tournamentParticipants.length === 0 
                    ? `Keine Teilnehmer für ${activeTournamentName} gefunden.` 
                    : 'Keine Teilnehmer gefunden, die Ihren Suchkriterien entsprechen.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {tournamentParticipants.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {tournamentParticipants.length} Teilnehmer insgesamt für {activeTournamentName}
        </div>
      )}
    </>
  );
};

export default ParticipantsList;
