
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, PenLine, Trash2 } from 'lucide-react';
import { Tournament } from '@/types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface TournamentsTableProps {
  tournaments: Tournament[];
  onSetActive: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onDelete: (tournament: Tournament) => void;
}

const TournamentsTable: React.FC<TournamentsTableProps> = ({
  tournaments,
  onSetActive,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead>Ort</TableHead>
          <TableHead>Jahr</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell className="font-medium">{tournament.name}</TableCell>
              <TableCell>{format(new Date(tournament.date), 'dd.MM.yyyy')}</TableCell>
              <TableCell>{tournament.location}</TableCell>
              <TableCell>{tournament.year}</TableCell>
              <TableCell>
                {tournament.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inaktiv
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!tournament.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetActive(tournament)}
                      className="h-8"
                    >
                      Aktivieren
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(tournament)}
                    className="h-8"
                  >
                    <PenLine className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(tournament)}
                    className="h-8"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Keine Turniere vorhanden. Klicken Sie auf "Neues Turnier", um ein Turnier zu erstellen.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TournamentsTable;
