
import React from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Participant } from '@/types';

interface TournamentParticipantsTableProps {
  filteredParticipants: Participant[];
  selectedParticipants: number[];
  toggleParticipant: (participantId: number) => void;
}

const TournamentParticipantsTable: React.FC<TournamentParticipantsTableProps> = ({
  filteredParticipants,
  selectedParticipants,
  toggleParticipant
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Ort</TableHead>
          <TableHead>Geburtsjahr</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(participant.id)}
                    onChange={() => toggleParticipant(participant.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {participant.firstName} {participant.lastName}
              </TableCell>
              <TableCell>{participant.location}</TableCell>
              <TableCell>{participant.birthYear}</TableCell>
              <TableCell>
                <Badge variant="outline">{participant.category}</Badge>
              </TableCell>
              <TableCell>
                {selectedParticipants.includes(participant.id) ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Zugewiesen
                  </span>
                ) : (
                  <span className="text-muted-foreground">Nicht zugewiesen</span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Keine Teilnehmer gefunden.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TournamentParticipantsTable;
