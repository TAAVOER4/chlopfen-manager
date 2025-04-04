
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ParticipantsFilterProps {
  searchTerm: string;
  selectedCategory: string;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
}

const ParticipantsFilter: React.FC<ParticipantsFilterProps> = ({
  searchTerm,
  selectedCategory,
  setSearchTerm,
  setSelectedCategory
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Teilnehmer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          Alle
        </Badge>
        <Badge
          variant={selectedCategory === 'kids' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('kids')}
        >
          Kinder
        </Badge>
        <Badge
          variant={selectedCategory === 'juniors' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('juniors')}
        >
          Junioren
        </Badge>
        <Badge
          variant={selectedCategory === 'active' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('active')}
        >
          Aktive
        </Badge>
        <Badge
          variant={selectedCategory === 'groupOnly' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('groupOnly')}
        >
          Nur Gruppe
        </Badge>
      </div>
    </div>
  );
};

export default ParticipantsFilter;
