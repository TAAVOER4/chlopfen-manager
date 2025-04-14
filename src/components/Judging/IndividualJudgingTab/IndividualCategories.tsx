
import React from 'react';
import { Category, Participant } from '@/types';
import CategoryCard from '../CategoryCard';

interface IndividualCategoriesProps {
  categories: Category[];
  participantsByCategory: Record<string, Participant[]>;
  isAdmin: boolean;
  openReorderDialog: (category: Category) => void;
}

const IndividualCategories: React.FC<IndividualCategoriesProps> = ({
  categories,
  participantsByCategory,
  isAdmin,
  openReorderDialog
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {categories.map((category) => {
        const participants = participantsByCategory[category] || [];
        return (
          <CategoryCard
            key={category}
            category={category}
            isAdmin={isAdmin}
            participants={participants}
            openReorderDialog={openReorderDialog}
          />
        );
      })}
    </div>
  );
};

export default IndividualCategories;
