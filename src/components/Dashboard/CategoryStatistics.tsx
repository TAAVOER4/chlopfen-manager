
import React from 'react';
import CategoryCard from './CategoryCard';
import { Category } from '@/types';

interface ParticipantStats {
  total: number;
  individual: number;
  groupOnly: number;
  byCategory: Record<string, {
    total: number;
    individual: number;
    groupOnly: number;
  }>;
}

interface CategoryStatisticsProps {
  participantStats: ParticipantStats;
}

const CategoryStatistics: React.FC<CategoryStatisticsProps> = ({ participantStats }) => {
  // Get category stats with default values if category doesn't exist
  const getCategoryStats = (category: Category) => {
    return participantStats.byCategory[category] || { total: 0, individual: 0, groupOnly: 0 };
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <CategoryCard 
        category="kids" 
        stats={getCategoryStats('kids')} 
      />
      <CategoryCard 
        category="juniors" 
        stats={getCategoryStats('juniors')} 
      />
      <CategoryCard 
        category="active" 
        stats={getCategoryStats('active')} 
      />
    </div>
  );
};

export default CategoryStatistics;
