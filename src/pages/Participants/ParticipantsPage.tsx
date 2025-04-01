
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Users } from 'lucide-react';
import { mockParticipants, mockGroups } from '../../data/mockData';
import { getCategoryDisplay } from '../../utils/categoryUtils';

const ParticipantsPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer</h1>
        <div className="flex space-x-2">
          <Link to="/participants/register">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Teilnehmer erfassen
            </Button>
          </Link>
          <Link to="/participants/register-group">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gruppe erfassen
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-10">
        {/* Individual Participants Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Einzelteilnehmer</h2>
          <Table>
            <TableCaption>Alle registrierten Teilnehmer</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Jahrgang</TableHead>
                <TableHead>Wohnort</TableHead>
                <TableHead>Gruppe</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.firstName} {participant.lastName}
                  </TableCell>
                  <TableCell>{getCategoryDisplay(participant.category)}</TableCell>
                  <TableCell>{participant.birthYear}</TableCell>
                  <TableCell>{participant.location}</TableCell>
                  <TableCell>
                    {participant.group ? 
                      mockGroups.find(g => g.id === participant.group)?.name || '-' : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    <Link to={`/participants/edit/${participant.id}`}>
                      <Button variant="ghost" size="sm">Bearbeiten</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Groups Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Gruppen</h2>
          <Table>
            <TableCaption>Alle registrierten Gruppen</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead>Mitglieder</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{getCategoryDisplay(group.category)}</TableCell>
                  <TableCell>{group.size === 'three' ? 'Dreiergruppe' : 'Vierergruppe'}</TableCell>
                  <TableCell>
                    {group.participantIds.map(id => {
                      const participant = mockParticipants.find(p => p.id === id);
                      return participant ? `${participant.firstName} ${participant.lastName}` : '';
                    }).join(', ')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </TableCell>
                </TableRow>
              ))}
              {mockGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Keine Gruppen vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
