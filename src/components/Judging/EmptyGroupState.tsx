
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { GroupSize, Category } from '../../types';
import { getCategoryDisplay } from '@/utils/categoryUtils';

interface EmptyGroupStateProps {
  size: GroupSize;
  categoryParam: Category | null;
  handleBackClick: () => void;
}

const EmptyGroupState: React.FC<EmptyGroupStateProps> = ({
  size,
  categoryParam,
  handleBackClick,
}) => {
  return (
    <div className="animate-fade-in">
      <Button 
        variant="outline" 
        onClick={handleBackClick} 
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Keine Gruppen gefunden</CardTitle>
          <CardDescription>
            Es wurden keine {size === 'three' ? 'Dreier' : 'Vierer'}gruppen 
            {categoryParam ? ` in der Kategorie ${getCategoryDisplay(categoryParam)}` : ''} gefunden
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default EmptyGroupState;
