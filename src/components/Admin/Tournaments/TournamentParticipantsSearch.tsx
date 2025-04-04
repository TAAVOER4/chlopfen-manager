
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TournamentParticipantsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

const TournamentParticipantsSearch: React.FC<TournamentParticipantsSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Teilnehmer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-2">
        <Badge
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          Alle
        </Badge>
        <Badge
          variant={filter === 'assigned' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('assigned')}
        >
          Zugewiesen
        </Badge>
        <Badge
          variant={filter === 'unassigned' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('unassigned')}
        >
          Nicht zugewiesen
        </Badge>
      </div>
    </div>
  );
};

export default TournamentParticipantsSearch;
