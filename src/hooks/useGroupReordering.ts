
import { useState } from 'react';
import { Group, GroupSize, GroupCategory } from '../types';
import { reorderGroups } from '@/utils/scoreUtils';
import { useToast } from '@/hooks/use-toast';
import { GroupOrderService } from '@/services/database/group/GroupOrderService';

export const useGroupReordering = (
  groupsBySizeAndCategory: Record<GroupSize, Record<GroupCategory, Group[]>>,
  setGroupsBySizeAndCategory: React.Dispatch<React.SetStateAction<Record<GroupSize, Record<GroupCategory, Group[]>>>>
) => {
  const [draggingSize, setDraggingSize] = useState<GroupSize | null>(null);
  const [draggingCategory, setDraggingCategory] = useState<GroupCategory | null>(null);
  const [activeReorderSize, setActiveReorderSize] = useState<GroupSize | null>(null);
  const [activeReorderCategory, setActiveReorderCategory] = useState<GroupCategory | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, size: GroupSize, category: GroupCategory) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ index, size, category }));
    setDraggingSize(size);
    setDraggingCategory(category);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number, size: GroupSize, category: GroupCategory) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent');

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.size !== size || data.category !== category) {
        toast({
          title: "Nicht möglich",
          description: "Gruppen können nicht zwischen Kategorien oder Größen verschoben werden.",
          variant: "destructive"
        });
        return;
      }

      if (data.index !== targetIndex) {
        const updatedGroups = reorderGroups(
          groupsBySizeAndCategory[size][category],
          data.index,
          targetIndex
        );
        
        setGroupsBySizeAndCategory(prev => ({
          ...prev,
          [size]: {
            ...prev[size],
            [category]: updatedGroups
          }
        }));

        // Save the reordered groups to the database
        saveGroupOrderToDatabase(updatedGroups);

        // Keep the session storage for backward compatibility
        sessionStorage.setItem(
          `reorderedGroups-${size}-${category}`, 
          JSON.stringify(updatedGroups)
        );

        toast({
          title: "Reihenfolge aktualisiert",
          description: "Die Reihenfolge der Gruppen wurde erfolgreich geändert."
        });
      }
    } catch (error) {
      console.error("Error during drag and drop:", error);
      toast({
        title: "Fehler",
        description: "Bei der Neuordnung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }

    setDraggingSize(null);
    setDraggingCategory(null);
  };

  const updateGroupOrder = (size: GroupSize, category: GroupCategory, groupId: number, newPosition: number) => {
    if (isNaN(newPosition) || newPosition < 1 || newPosition > groupsBySizeAndCategory[size][category].length) {
      toast({
        title: "Ungültige Position",
        description: `Position muss zwischen 1 und ${groupsBySizeAndCategory[size][category].length} sein.`,
        variant: "destructive"
      });
      return;
    }

    const groups = groupsBySizeAndCategory[size][category];
    const oldIndex = groups.findIndex(g => g.id === groupId);
    const newIndex = newPosition - 1;

    if (oldIndex === newIndex) return;

    const updatedGroups = reorderGroups(groups, oldIndex, newIndex);
    
    setGroupsBySizeAndCategory(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [category]: updatedGroups
      }
    }));

    // Save the reordered groups to the database
    saveGroupOrderToDatabase(updatedGroups);

    // Keep the session storage for backward compatibility
    sessionStorage.setItem(
      `reorderedGroups-${size}-${category}`, 
      JSON.stringify(updatedGroups)
    );

    toast({
      title: "Reihenfolge aktualisiert",
      description: "Die Reihenfolge der Gruppen wurde erfolgreich geändert."
    });
  };

  // Helper function to save the group order to the database
  const saveGroupOrderToDatabase = async (groups: Group[]) => {
    try {
      // Create an array of updates with id and new display order
      const updates = groups.map((group, index) => ({
        id: group.id,
        displayOrder: index + 1
      }));

      // Bulk update the display orders
      await GroupOrderService.bulkUpdateGroupDisplayOrder(updates);
      console.log('Group display order saved to database');
    } catch (error) {
      console.error('Error saving group order to database:', error);
      toast({
        title: "Speicherfehler",
        description: "Die Reihenfolge konnte nicht in der Datenbank gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const openReorderDialog = (size: GroupSize, category: GroupCategory) => {
    console.log("Opening reorder dialog for:", size, category);
    setActiveReorderSize(size);
    setActiveReorderCategory(category);
  };

  const closeReorderDialog = () => {
    setActiveReorderSize(null);
    setActiveReorderCategory(null);
  };

  return {
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
  };
};
