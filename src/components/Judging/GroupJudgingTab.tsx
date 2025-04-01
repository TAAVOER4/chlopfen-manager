
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GroupSize, GroupCategory, Group } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { mockGroups } from '@/data/mockData';
import { useGroupReordering } from '@/hooks/useGroupReordering';
import GroupReorderDialog from './GroupReorderDialog';
import CategoryGroupCard from './CategoryGroupCard';
import GroupJudgingTabHeader from './GroupJudgingTabHeader';

const GroupJudgingTab = () => {
  const { isAdmin } = useUser();
  
  // State for groups organized by size and category
  const [groupsBySizeAndCategory, setGroupsBySizeAndCategory] = useState<Record<GroupSize, Record<GroupCategory, Group[]>>>(() => {
    const initialGroups: Record<GroupSize, Record<GroupCategory, Group[]>> = {
      three: { kids_juniors: [], active: [] },
      four: { kids_juniors: [], active: [] }
    };
    
    // First check if we have any stored orders in session storage
    const sizes: GroupSize[] = ['three', 'four'];
    const categories: GroupCategory[] = ['kids_juniors', 'active'];
    
    // Try to load groups from session storage first
    let hasLoadedFromStorage = false;
    
    sizes.forEach(size => {
      categories.forEach(category => {
        const storageKey = `reorderedGroups-${size}-${category}`;
        const storedGroups = sessionStorage.getItem(storageKey);
        
        if (storedGroups) {
          try {
            const parsedGroups: Group[] = JSON.parse(storedGroups);
            initialGroups[size][category] = parsedGroups;
            hasLoadedFromStorage = true;
          } catch (error) {
            console.error(`Error parsing stored groups for ${size}-${category}:`, error);
          }
        }
      });
    });
    
    // If nothing was loaded from storage, use the mockGroups
    if (!hasLoadedFromStorage) {
      mockGroups.forEach(group => {
        initialGroups[group.size][group.category].push(group);
      });
    } else {
      // Find any mockGroups that might not be in any category yet
      // (for example, new groups added after storage was saved)
      mockGroups.forEach(group => {
        const isAlreadyIncluded = initialGroups[group.size][group.category]
          .some(g => g.id === group.id);
          
        if (!isAlreadyIncluded) {
          initialGroups[group.size][group.category].push(group);
        }
      });
    }
    
    return initialGroups;
  });
  
  // Use the custom hook for group reordering
  const {
    draggingSize,
    draggingCategory,
    activeReorderSize,
    activeReorderCategory,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    updateGroupOrder,
    openReorderDialog,
    closeReorderDialog,
  } = useGroupReordering(groupsBySizeAndCategory, setGroupsBySizeAndCategory);

  // Store reordered groups in session storage whenever they change
  useEffect(() => {
    Object.keys(groupsBySizeAndCategory).forEach((size) => {
      const sizeKey = size as GroupSize;
      Object.keys(groupsBySizeAndCategory[sizeKey]).forEach((category) => {
        const categoryKey = category as GroupCategory;
        const groups = groupsBySizeAndCategory[sizeKey][categoryKey];
        
        // Only store if there are groups in this category
        if (groups.length > 0) {
          sessionStorage.setItem(
            `reorderedGroups-${sizeKey}-${categoryKey}`, 
            JSON.stringify(groups)
          );
        }
      });
    });
  }, [groupsBySizeAndCategory]);

  // Create an array of card configurations based on the requested layout
  const cardConfigs = [
    { categoryLabel: 'Kids/Junioren', size: 'three' as GroupSize, category: 'kids_juniors' as GroupCategory },
    { categoryLabel: 'Kids/Junioren', size: 'four' as GroupSize, category: 'kids_juniors' as GroupCategory },
    { categoryLabel: 'Aktive', size: 'three' as GroupSize, category: 'active' as GroupCategory },
    { categoryLabel: 'Aktive', size: 'four' as GroupSize, category: 'active' as GroupCategory }
  ];

  return (
    <>
      <Card>
        <GroupJudgingTabHeader />
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cardConfigs.map((config, index) => (
              <CategoryGroupCard
                key={`${config.categoryLabel}-${config.size}-${index}`}
                categoryLabel={config.categoryLabel}
                size={config.size}
                category={config.category}
                isAdmin={isAdmin}
                groups={groupsBySizeAndCategory[config.size][config.category]}
                openReorderDialog={openReorderDialog}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <GroupReorderDialog
        activeReorderSize={activeReorderSize}
        activeReorderCategory={activeReorderCategory}
        closeReorderDialog={closeReorderDialog}
        groupsBySizeAndCategory={groupsBySizeAndCategory}
        updateGroupOrder={updateGroupOrder}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        draggingSize={draggingSize}
        draggingCategory={draggingCategory}
      />
    </>
  );
};

export default GroupJudgingTab;
