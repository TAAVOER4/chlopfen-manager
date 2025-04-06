
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getCategoryDisplay } from '@/utils/categoryUtils';
import { Category } from '@/types';

interface CategoryStats {
  total: number;
  individual: number;
  groupOnly: number;
}

interface CategoryCardProps {
  category: Category;
  stats: CategoryStats;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, stats }) => {
  const getCategoryColorClass = (category: Category): string => {
    switch (category) {
      case 'kids':
        return 'bg-green-500';
      case 'juniors':
        return 'bg-blue-500';
      case 'active':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{getCategoryDisplay(category)}</span>
          <div className={`h-4 w-4 rounded-full ${getCategoryColorClass(category)}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Total:</div>
          <div className="font-medium">{stats.total}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Einzelwertung:</div>
          <div className="font-medium">{stats.individual}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
          <div className="font-medium">{stats.groupOnly}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
