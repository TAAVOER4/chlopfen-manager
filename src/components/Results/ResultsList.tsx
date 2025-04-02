
import React from 'react';
import { Medal } from 'lucide-react';
import { ParticipantResult } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResultsListProps {
  results: ParticipantResult[];
}

const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rang</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Wohnort</TableHead>
          <TableHead className="text-right">Jahrgang</TableHead>
          <TableHead className="text-right">Punkte (beide Durchgänge)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow key={result.participant.id}>
            <TableCell className="font-bold">
              {result.rank <= 3 ? (
                <div className="flex items-center">
                  <Medal className={`h-5 w-5 mr-1 ${
                    result.rank === 1 ? 'text-yellow-500' : 
                    result.rank === 2 ? 'text-gray-400' : 'text-amber-700'
                  }`} />
                  {result.rank}
                </div>
              ) : result.rank}
            </TableCell>
            <TableCell>
              {result.participant.firstName} {result.participant.lastName}
            </TableCell>
            <TableCell>{result.participant.location}</TableCell>
            <TableCell className="text-right">{result.participant.birthYear}</TableCell>
            <TableCell className="text-right font-medium">
              {Math.round(result.totalScore * 10) / 10}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ResultsList;
