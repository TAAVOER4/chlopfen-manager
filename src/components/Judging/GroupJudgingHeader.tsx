
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { GroupSize, Category } from '../../types';
import { getCategoryDisplay } from '@/utils/categoryUtils';

interface GroupJudgingHeaderProps {
  size: GroupSize;
  categoryName: string;
  handleBackClick: () => void;
  currentGroupIndex: number;
  totalGroups: number;
  currentGroupName: string;
}

const GroupJudgingHeader: React.FC<GroupJudgingHeaderProps> = ({
  size,
  categoryName,
  handleBackClick,
  currentGroupIndex,
  totalGroups,
  currentGroupName,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">
          {categoryName} - {size === 'three' ? 'Dreiergruppen' : 'Vierergruppen'} Bewertung
        </h1>
        <Button 
          variant="outline" 
          onClick={handleBackClick} 
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">{currentGroupName}</h2>
        <p className="text-sm text-muted-foreground">
          Gruppe {currentGroupIndex + 1} von {totalGroups}
        </p>
      </div>
    </>
  );
};

export default GroupJudgingHeader;
