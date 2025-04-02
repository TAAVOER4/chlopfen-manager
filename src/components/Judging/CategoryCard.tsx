
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Move, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Category, Participant } from '../../types';
import { getCategoryDisplay, getCategoryRequiredStrikes } from '../../utils/categoryUtils';

interface CategoryCardProps {
  category: Category;
  isAdmin: boolean;
  participants: Participant[];
  openReorderDialog: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isAdmin,
  participants,
  openReorderDialog
}) => {
  return <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            {getCategoryDisplay(category)}
          </div>
          {isAdmin && <Button variant="outline" size="sm" onClick={() => openReorderDialog(category)} className="h-8 w-8 p-0">
              <Move className="h-4 w-4" />
            </Button>}
        </CardTitle>
        <CardDescription>
          {participants.length} Teilnehmer
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {getCategoryRequiredStrikes(category)} Schläge
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={participants.length === 0}>
          <Link to={`/judging/individual/${category}`}>
            Bewerten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>;
};

export default CategoryCard;
