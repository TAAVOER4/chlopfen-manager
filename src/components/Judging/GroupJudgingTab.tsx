
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/DatabaseService';
import { Card, CardContent } from '@/components/ui/card';
import { GroupSize, GroupCategory, Group } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { useGroupReordering } from '@/hooks/useGroupReordering';
import GroupReorderDialog from './GroupReorderDialog';
import CategoryGroupCard from './CategoryGroupCard';
import GroupJudgingTabHeader from './GroupJudgingTabHeader';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { checkSupabaseConnection } from '@/lib/supabase';

const GroupJudgingTab = () => {
  const { isAdmin, selectedTournament } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  const [groupsBySizeAndCategory, setGroupsBySizeAndCategory] = useState<Record<GroupSize, Record<GroupCategory, Group[]>>>({
    three: { kids_juniors: [], active: [] },
    four: { kids_juniors: [], active: [] }
  });
  
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        // First check if the Supabase connection is working
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error('Supabase connection failed');
          setConnectionError(true);
          setLoading(false);
          toast({
            title: "Verbindungsfehler",
            description: "Die Verbindung zur Datenbank konnte nicht hergestellt werden.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('Loading groups for GroupJudgingTab...');
        const allGroups = await DatabaseService.getAllGroups();
        console.log('Loaded groups from database:', allGroups);
        
        const tournamentGroups = selectedTournament?.id 
          ? allGroups.filter(group => group.tournamentId === selectedTournament.id)
          : allGroups;
        
        console.log('Filtered for tournament:', tournamentGroups.length, 'groups');
        
        const initialGroups: Record<GroupSize, Record<GroupCategory, Group[]>> = {
          three: { kids_juniors: [], active: [] },
          four: { kids_juniors: [], active: [] }
        };
        
        tournamentGroups.forEach(group => {
          // Skip groups with invalid size or category
          if (!group.size || !group.category) {
            console.warn('Group with missing size or category:', group);
            return;
          }
          
          if (!initialGroups[group.size]) {
            console.warn('Unknown group size:', group.size);
            return;
          }
          
          if (!initialGroups[group.size][group.category]) {
            console.warn('Unknown group category:', group.category);
            return;
          }
          
          initialGroups[group.size][group.category].push(group);
        });
        
        Object.keys(initialGroups).forEach((size) => {
          const sizeKey = size as GroupSize;
          Object.keys(initialGroups[sizeKey]).forEach((category) => {
            const categoryKey = category as GroupCategory;
            initialGroups[sizeKey][categoryKey].sort((a, b) => {
              if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
                return a.displayOrder - b.displayOrder;
              }
              if (a.displayOrder !== undefined) return -1;
              if (b.displayOrder !== undefined) return 1;
              return a.id - b.id;
            });
          });
        });
        
        console.log('Organized groups:', initialGroups);
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

  if (connectionError) {
    return (
      <Card>
        <GroupJudgingTabHeader />
        <CardContent className="pt-0">
          <div className="p-6 text-center">
            <p className="text-red-500 font-medium mb-2">Verbindungsfehler</p>
            <p className="text-muted-foreground">Die Verbindung zur Datenbank konnte nicht hergestellt werden.</p>
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
