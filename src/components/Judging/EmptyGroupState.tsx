
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { GroupSize, GroupCategory } from '../../types';

interface EmptyGroupStateProps {
  size: GroupSize;
  categoryParam: GroupCategory | null;
  handleBackClick: () => void;
}

const EmptyGroupState: React.FC<EmptyGroupStateProps> = ({ size, categoryParam, handleBackClick }) => {
  const sizeText = size === 'three' ? 'Dreiergruppen' : 'Vierergruppen';
  const categoryText = categoryParam ? 
    (categoryParam === 'kids_juniors' ? 'Kids/Junioren' : 'Aktive') : 
    'der ausgewählten Kategorie';

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Keine Gruppen gefunden</h2>
          <p className="text-muted-foreground">
            Es wurden keine {sizeText} in {categoryText} gefunden.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={handleBackClick}>
            Zurück zur Bewertungsübersicht
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmptyGroupState;
