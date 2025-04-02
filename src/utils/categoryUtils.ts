
import { Category, GroupCategory, AllCategory } from '../types';

export const determineCategory = (birthYear: number): Category => {
  const currentYear = new Date().getFullYear();
  
  const kidsThresholdYear = currentYear - 12;  // Kids are up to 12 years old
  const juniorsLowerThresholdYear = currentYear - 16; // Juniors lower bound (16 years old)
  const juniorsUpperThresholdYear = currentYear - 13; // Juniors upper bound (13 years old)
  
  if (birthYear >= kidsThresholdYear) {
    return 'kids';
  } else if (birthYear >= juniorsLowerThresholdYear && birthYear <= juniorsUpperThresholdYear) {
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

export const getCategoryDisplay = (category: Category | GroupCategory | AllCategory): string => {
  switch (category) {
    case 'kids':
      return 'Kids';
    case 'juniors':
      return 'Junioren';
    case 'active':
      return 'Aktive';
    case 'kids_juniors':
      return 'Kids/Junioren';
    case 'all':
      return 'Alle';
    default:
      return '';
  }
};

export const getCategoryClass = (category: Category | GroupCategory | AllCategory): string => {
  switch (category) {
    case 'kids':
      return 'category-kids';
    case 'juniors':
      return 'category-juniors';
    case 'active':
      return 'category-active';
    case 'kids_juniors':
      return 'category-kids-juniors';
    case 'all':
      return 'category-all';
    default:
      return '';
  }
};

export const mapToGroupCategory = (category: Category): GroupCategory => {
  return category === 'active' ? 'active' : 'kids_juniors';
};

// New helper function to check if category is AllCategory
export const isAllCategory = (category: Category | GroupCategory | AllCategory): category is AllCategory => {
  return category === 'all';
};

// New helper function to check if a category matches the all-inclusive 'all' category
export const categoryMatchesAll = (itemCategory: Category | GroupCategory | AllCategory | undefined, filterCategory?: Category | GroupCategory): boolean => {
  // If the item is specifically marked as "all" category, it matches any filter
  if (itemCategory === 'all') return true;
  
  // If no filter specified, show everything
  if (!filterCategory) return true;
  
  // If filtering by group category 'kids_juniors', show both kids and juniors items
  if (filterCategory === 'kids_juniors' && (itemCategory === 'kids' || itemCategory === 'juniors')) {
    return true;
  }
  
  // Direct match
  return itemCategory === filterCategory;
};
