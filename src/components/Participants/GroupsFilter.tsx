
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GroupCategory, GroupSize } from '@/types';

interface GroupsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: GroupCategory | 'all';
  setSelectedCategory: (category: GroupCategory | 'all') => void;
  selectedSize: GroupSize | 'all';
  setSelectedSize: (size: GroupSize | 'all') => void;
}

const GroupsFilter: React.FC<GroupsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSize,
  setSelectedSize
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Gruppen suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-2 mr-4">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('all')}
          >
            Alle
          </Badge>
          <Badge
            variant={selectedCategory === 'active' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('active')}
          >
            Aktive
          </Badge>
          <Badge
            variant={selectedCategory === 'kids_juniors' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('kids_juniors')}
          >
            Kids/Junioren
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={selectedSize === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedSize('all')}
          >
            Alle Größen
          </Badge>
          <Badge
            variant={selectedSize === 'three' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedSize('three')}
          >
            3er Gruppen
          </Badge>
          <Badge
            variant={selectedSize === 'four' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedSize('four')}
          >
            4er Gruppen
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default GroupsFilter;
