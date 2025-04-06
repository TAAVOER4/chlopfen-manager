
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GroupSize, GroupCategory, Group } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { GroupService } from '@/services/database/GroupService';
import { useGroupReordering } from '@/hooks/useGroupReordering';
import GroupReorderDialog from './GroupReorderDialog';
import CategoryGroupCard from './CategoryGroupCard';
import GroupJudgingTabHeader from './GroupJudgingTabHeader';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const GroupJudgingTab = () => {
  const { isAdmin, selectedTournament } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // State for groups organized by size and category
  const [groupsBySizeAndCategory, setGroupsBySizeAndCategory] = useState<Record<GroupSize, Record<GroupCategory, Group[]>>>({
    three: { kids_juniors: [], active: [] },
    four: { kids_juniors: [], active: [] }
  });
  
  // Load groups from the database
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const allGroups = await GroupService.getAllGroups();
        console.log('Loaded groups from database:', allGroups);
        
        // Filter by tournament if available
        const tournamentGroups = selectedTournament?.id 
          ? allGroups.filter(group => group.tournamentId === selectedTournament.id)
          : allGroups;
        
        // Initialize with empty arrays
        const initialGroups: Record<GroupSize, Record<GroupCategory, Group[]>> = {
          three: { kids_juniors: [], active: [] },
          four: { kids_juniors: [], active: [] }
        };
        
        // Organize groups by size and category
        tournamentGroups.forEach(group => {
          initialGroups[group.size][group.category].push(group);
        });
        
        // Sort groups by displayOrder if available
        Object.keys(initialGroups).forEach((size) => {
          const sizeKey = size as GroupSize;
          Object.keys(initialGroups[sizeKey]).forEach((category) => {
            const categoryKey = category as GroupCategory;
            initialGroups[sizeKey][categoryKey].sort((a, b) => {
              // If both have displayOrder, sort by it
              if (a.displayOrder && b.displayOrder) {
                return a.displayOrder - b.displayOrder;
              }
              // If only one has displayOrder, prioritize it
              if (a.displayOrder) return -1;
              if (b.displayOrder) return 1;
              // Default to id sort
              return a.id - b.id;
            });
          });
        });
        
        setGroupsBySizeAndCategory(initialGroups);
      } catch (error) {
        console.error('Error loading groups:', error);
        toast({
          title: "Fehler",
          description: "Gruppen konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [selectedTournament, toast]);
  
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

  // Create an array of card configurations based on the requested layout
  const cardConfigs = [
    { categoryLabel: 'Kids/Junioren', size: 'three' as GroupSize, category: 'kids_juniors' as GroupCategory },
    { categoryLabel: 'Kids/Junioren', size: 'four' as GroupSize, category: 'kids_juniors' as GroupCategory },
    { categoryLabel: 'Aktive', size: 'three' as GroupSize, category: 'active' as GroupCategory },
    { categoryLabel: 'Aktive', size: 'four' as GroupSize, category: 'active' as GroupCategory }
  ];

  if (loading) {
    return (
      <Card>
        <GroupJudgingTabHeader />
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
