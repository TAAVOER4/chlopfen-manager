
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, MoveVertical, User } from 'lucide-react';
import { Category, GroupSize, Group } from '../../types';

interface CategoryGroupCardProps {
  categoryLabel: string;
  size: GroupSize;
  category: Category;
  isAdmin: boolean;
  groups: Group[];
  openReorderDialog: (size: GroupSize, category: Category) => void;
}

const CategoryGroupCard: React.FC<CategoryGroupCardProps> = ({
  categoryLabel,
  size,
  category,
  isAdmin,
  groups,
  openReorderDialog
}) => {
  // Helper function to get display text for group size
  const getGroupSizeDisplay = (size: GroupSize): string => {
    return size === 'three' ? 'Dreiergruppen' : 'Vierergruppen';
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-base">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            {categoryLabel} - {getGroupSizeDisplay(size)}
          </div>
          {isAdmin && groups.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openReorderDialog(size, category)}
              title="Reihenfolge anpassen"
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          45 Sekunden
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col justify-between h-full">
        <p className="text-sm text-muted-foreground mb-2">
          {groups.length} Gruppen
          {groups.length > 1 && isAdmin && (
            <span className="ml-2 text-xs text-primary">
              (Reihenfolge anpassbar)
            </span>
          )}
        </p>
        <Button 
          asChild 
          className="w-full mt-2"
        >
          <Link to={`/judging/group/${size}?category=${category}`}>
            Bewerten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CategoryGroupCard;
