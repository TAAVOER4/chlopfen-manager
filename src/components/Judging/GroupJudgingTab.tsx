
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Users, ChevronRight, ListRestart } from 'lucide-react';
import { mockGroups } from '../../data/mockData';
import { Group, Category, GroupSize } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { getCategoryDisplay } from '@/utils/categoryUtils';
import { useGroupReordering } from '@/hooks/useGroupReordering';
import GroupReorderDialog from './GroupReorderDialog';

const GroupJudgingTab = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];
  
  // State to store groups organized by size and category
  const [groupsBySizeAndCategory, setGroupsBySizeAndCategory] = useState<
    Record<GroupSize, Record<Category, Group[]>>
  >(() => {
    const groups: Record<GroupSize, Record<Category, Group[]>> = {
      three: { kids: [], juniors: [], active: [] },
      four: { kids: [], juniors: [], active: [] },
    };

    mockGroups.forEach((group) => {
      groups[group.size][group.category].push(group);
    });

    return groups;
  });

  // Effect to update mockGroups when groupsBySizeAndCategory changes
  useEffect(() => {
    const allGroups: Group[] = [];
    
    Object.values(groupsBySizeAndCategory).forEach((sizeGroups) => {
      Object.values(sizeGroups).forEach((categoryGroups) => {
        categoryGroups.forEach((group) => {
          allGroups.push(group);
        });
      });
    });
    
    // Update mockGroups (in a real app this would be an API call)
    mockGroups.splice(0, mockGroups.length);
    allGroups.forEach((group) => {
      mockGroups.push(group);
    });
  }, [groupsBySizeAndCategory]);

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

  const handleStartJudging = (size: 'three' | 'four') => {
    navigate(`/judging/group/${size}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Dreiergruppen Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Dreiergruppen</CardTitle>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => handleStartJudging('three')}
              >
                Bewerten <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={`three-${category}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{getCategoryDisplay(category)}</h3>
                    {isAdmin && groupsBySizeAndCategory.three[category].length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => openReorderDialog('three', category)}
                      >
                        <ListRestart className="h-3 w-3 mr-1" />
                        Reihenfolge
                      </Button>
                    )}
                  </div>
                  
                  {groupsBySizeAndCategory.three[category].length > 0 ? (
                    <div className="space-y-2">
                      {groupsBySizeAndCategory.three[category].map((group, index) => (
                        <div 
                          key={group.id}
                          className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50"
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <Users className="h-4 w-4" />
                            </Avatar>
                            <span>{group.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      Keine Dreiergruppen in dieser Kategorie
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleStartJudging('three')}
            >
              Dreiergruppen bewerten
            </Button>
          </CardFooter>
        </Card>

        {/* Vierergruppen Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Vierergruppen</CardTitle>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => handleStartJudging('four')}
              >
                Bewerten <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={`four-${category}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{getCategoryDisplay(category)}</h3>
                    {isAdmin && groupsBySizeAndCategory.four[category].length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => openReorderDialog('four', category)}
                      >
                        <ListRestart className="h-3 w-3 mr-1" />
                        Reihenfolge
                      </Button>
                    )}
                  </div>
                  
                  {groupsBySizeAndCategory.four[category].length > 0 ? (
                    <div className="space-y-2">
                      {groupsBySizeAndCategory.four[category].map((group, index) => (
                        <div 
                          key={group.id}
                          className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50"
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <Users className="h-4 w-4" />
                            </Avatar>
                            <span>{group.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      Keine Vierergruppen in dieser Kategorie
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => handleStartJudging('four')}
            >
              Vierergruppen bewerten
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Group Reorder Dialog */}
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
    </div>
  );
};

export default GroupJudgingTab;
