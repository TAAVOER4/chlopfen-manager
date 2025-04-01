
import { Category, GroupCategory } from '../types';

export const determineCategory = (birthYear: number): Category => {
  const currentYear = new Date().getFullYear();
  
  if (birthYear >= 2010) {
    return 'kids';
  } else if (birthYear >= 2006 && birthYear <= 2009) {
    return 'juniors';
  } else {
    return 'active';
  }
};

export const getCategoryRequiredStrikes = (category: Category): number => {
  switch (category) {
    case 'kids':
      return 17;
    case 'juniors':
      return 23;
    case 'active':
      return 33;
    default:
      return 0;
  }
};

export const getCategoryDisplay = (category: Category | GroupCategory): string => {
  switch (category) {
    case 'kids':
      return 'Kids';
    case 'juniors':
      return 'Junioren';
    case 'active':
      return 'Aktive';
    case 'kids_juniors':
      return 'Kids/Junioren';
    default:
      return '';
  }
};

export const getCategoryClass = (category: Category | GroupCategory): string => {
  switch (category) {
    case 'kids':
      return 'category-kids';
    case 'juniors':
      return 'category-juniors';
    case 'active':
      return 'category-active';
    case 'kids_juniors':
      return 'category-kids-juniors';
    default:
      return '';
  }
};

// Helper function to map individual participant category to group category
export const mapToGroupCategory = (category: Category): GroupCategory => {
  return category === 'active' ? 'active' : 'kids_juniors';
};
