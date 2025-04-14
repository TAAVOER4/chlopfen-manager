
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group, Participant, GroupCategory, GroupSize } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GroupsFilter from './GroupsFilter';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GroupCategory | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<GroupSize | 'all'>('all');

  const tournamentGroups = groups.filter(g => g.tournamentId === activeTournamentId);
  
  const filteredGroups = tournamentGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSize = selectedSize === 'all' || group.size === selectedSize;
    return matchesSearch && matchesCategory && matchesSize;
  });

  const getParticipantNames = (participantIds: number[]) => {
    return participantIds
      .map(id => {
        const participant = participants.find(p => p.id === id);
        return participant ? `${participant.firstName} ${participant.lastName}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  if (tournamentGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 min-h-[300px] flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">
          Keine Gruppen für {activeTournamentName} gefunden.
        </p>
        <Button onClick={() => navigate('/participants/register-group')}>
          <Plus className="h-4 w-4 mr-2" />
          Gruppe erstellen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GroupsFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Größe</TableHead>
              <TableHead>Teilnehmer</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.category === 'kids_juniors' ? 'Kids/Junioren' : 'Aktive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {group.size === 'three' ? '3er' : '4er'} Gruppe
                    </Badge>
                  </TableCell>
                  <TableCell>{getParticipantNames(group.participantIds)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/participants/edit-group/${group.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Keine Gruppen gefunden, die Ihren Suchkriterien entsprechen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        {tournamentGroups.length} Gruppen insgesamt für {activeTournamentName}
      </div>
    </div>
  );
};

export default GroupsList;
