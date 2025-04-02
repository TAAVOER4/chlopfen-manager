
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Result {
  rank: number;
  name: string;
  location: string;
  score: number;
}

interface ResultsTableProps {
  results: Result[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rang</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Ort</TableHead>
          <TableHead className="text-right">Punkte</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.length > 0 ? (
          results.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{result.rank}</TableCell>
              <TableCell>{result.name}</TableCell>
              <TableCell>{result.location}</TableCell>
              <TableCell className="text-right">{result.score}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              Keine Ergebnisse gefunden.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
