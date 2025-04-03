
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tournament } from '@/types';

interface TournamentSelectProps {
  tournaments: Tournament[];
  selectedTournamentId: string;
  onSelect: (value: string) => void;
}

const TournamentSelect: React.FC<TournamentSelectProps> = ({
  tournaments,
  selectedTournamentId,
  onSelect
}) => {
  if (!tournaments || tournaments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tournament">Active Tournament</Label>
      <Select 
        value={selectedTournamentId} 
        onValueChange={onSelect}
      >
        <SelectTrigger id="tournament">
          <SelectValue placeholder="Select tournament" />
        </SelectTrigger>
        <SelectContent>
          {tournaments.map((tournament) => (
            <SelectItem 
              key={tournament.id} 
              value={tournament.id.toString()}
            >
              {tournament.name} ({tournament.year})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TournamentSelect;
