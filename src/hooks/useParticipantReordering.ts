
import { useState } from 'react';
import { Category, Participant } from '../types';
import { reorderParticipants } from '@/utils/scoreUtils';
import { useToast } from '@/hooks/use-toast';

export const useParticipantReordering = (participantsByCategory: Record<string, Participant[]>, setParticipantsByCategory: React.Dispatch<React.SetStateAction<Record<string, Participant[]>>>) => {
  const [draggingCategory, setDraggingCategory] = useState<Category | null>(null);
  const [activeReorderCategory, setActiveReorderCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, category: Category) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ index, category }));
    setDraggingCategory(category);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number, category: Category) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent');

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.category !== category) {
        toast({
          title: "Nicht möglich",
          description: "Teilnehmer können nicht zwischen Kategorien verschoben werden.",
          variant: "destructive"
        });
        return;
      }

      if (data.index !== targetIndex) {
        const updatedParticipants = reorderParticipants(
          participantsByCategory[category],
          data.index,
          targetIndex
        );
        
        setParticipantsByCategory(prev => ({
          ...prev,
          [category]: updatedParticipants
        }));

        toast({
          title: "Reihenfolge aktualisiert",
          description: "Die Reihenfolge der Teilnehmer wurde erfolgreich geändert."
        });
      }
    } catch (error) {
      console.error("Error during drag and drop:", error);
    }

    setDraggingCategory(null);
  };

  const updateParticipantOrder = (category: Category, participantId: number, newPosition: number) => {
    if (isNaN(newPosition) || newPosition < 1 || newPosition > participantsByCategory[category].length) {
      toast({
        title: "Ungültige Position",
        description: `Position muss zwischen 1 und ${participantsByCategory[category].length} sein.`,
        variant: "destructive"
      });
      return;
    }

    const participants = participantsByCategory[category];
    const oldIndex = participants.findIndex(p => p.id === participantId);
    const newIndex = newPosition - 1;

    if (oldIndex === newIndex) return;

    const updatedParticipants = reorderParticipants(participants, oldIndex, newIndex);
    
    setParticipantsByCategory(prev => ({
      ...prev,
      [category]: updatedParticipants
    }));

    toast({
      title: "Reihenfolge aktualisiert",
      description: "Die Reihenfolge der Teilnehmer wurde erfolgreich geändert."
    });
  };

  const openReorderDialog = (category: Category) => {
    setActiveReorderCategory(category);
  };

  return {
    draggingCategory,
    activeReorderCategory,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    updateParticipantOrder,
    openReorderDialog,
    setActiveReorderCategory,
  };
};
