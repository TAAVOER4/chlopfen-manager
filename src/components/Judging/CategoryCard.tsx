
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Category, Participant } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          {getCategoryDisplay(category)}
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => openReorderDialog(category)}
              className="ml-2"
            >
              <Move className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {participants.length} Teilnehmer
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 space-y-4">
        <p className="text-sm text-muted-foreground">
          {category === 'kids' ? '17 Schläge' : 
           category === 'juniors' ? '23 Schläge' : '33 Schläge'}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/judging/individual/${category}`}>
            Bewerten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
