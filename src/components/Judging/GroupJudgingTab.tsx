
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, ArrowRight, MoveVertical } from 'lucide-react';
import { Category, GroupSize, Group } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { getCategoryDisplay } from '@/utils/categoryUtils';
import { mockGroups } from '@/data/mockData';
import { useGroupReordering } from '@/hooks/useGroupReordering';
import GroupReorderDialog from './GroupReorderDialog';

const GroupJudgingTab = () => {
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];
  const groupSizes: GroupSize[] = ['three', 'four'];
  
  // State for groups organized by size and category
  const [groupsBySizeAndCategory, setGroupsBySizeAndCategory] = useState<Record<GroupSize, Record<Category, Group[]>>>(() => {
    const initialGroups: Record<GroupSize, Record<Category, Group[]>> = {
      three: { kids: [], juniors: [], active: [] },
      four: { kids: [], juniors: [], active: [] }
    };
    
    mockGroups.forEach(group => {
      initialGroups[group.size][group.category].push(group);
    });
    
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

  // Helper function to get display text for group size
  const getGroupSizeDisplay = (size: GroupSize): string => {
    return size === 'three' ? 'Dreiergruppen' : 'Vierergruppen';
  };

  // Create an array of card configurations based on the requested layout
  const cardConfigs = [
    { categoryLabel: 'Kids/Junioren', size: 'three' as GroupSize, category: 'kids' as Category },
    { categoryLabel: 'Kids/Junioren', size: 'four' as GroupSize, category: 'juniors' as Category },
    { categoryLabel: 'Aktive', size: 'three' as GroupSize, category: 'active' as Category },
    { categoryLabel: 'Aktive', size: 'four' as GroupSize, category: 'active' as Category }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gruppenbewertung</CardTitle>
          <CardDescription>
            Bewerten Sie die Gruppenperformances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Bei der Gruppenbewertung werden folgende Kriterien bewertet:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>Schläge</li>
            <li>Rhythmus</li>
            <li>Takt</li>
          </ul>

          <p className="mb-4">Wählen Sie eine Kategorie für die Bewertung:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cardConfigs.map((config, index) => (
              <Card key={`${config.categoryLabel}-${config.size}-${index}`} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-base">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {config.categoryLabel} - {getGroupSizeDisplay(config.size)}
                    </div>
                    {isAdmin && groupsBySizeAndCategory[config.size][config.category].length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openReorderDialog(config.size, config.category)}
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
                    {groupsBySizeAndCategory[config.size][config.category].length} Gruppen
                    {groupsBySizeAndCategory[config.size][config.category].length > 1 && isAdmin && (
                      <span className="ml-2 text-xs text-primary">
                        (Reihenfolge anpassbar)
                      </span>
                    )}
                  </p>
                  <Button 
                    asChild 
                    className="w-full mt-2"
                  >
                    <Link to={`/judging/group/${config.size}?category=${config.category}`}>
                      Bewerten
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
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
