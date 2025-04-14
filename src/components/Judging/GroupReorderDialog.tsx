
import React, { useRef, useEffect } from 'react';
import { Move } from 'lucide-react';
import { GroupCategory, GroupSize, Group } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GroupReorderDialogProps {
  activeReorderSize: GroupSize | null;
  activeReorderCategory: GroupCategory | null;
  closeReorderDialog: () => void;
  groupsBySizeAndCategory: Record<GroupSize, Record<GroupCategory, Group[]>>;
  updateGroupOrder: (size: GroupSize, category: GroupCategory, groupId: number, newPosition: number) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number, size: GroupSize, category: GroupCategory) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number, size: GroupSize, category: GroupCategory) => void;
  draggingSize: GroupSize | null;
  draggingCategory: GroupCategory | null;
}

const GroupReorderDialog: React.FC<GroupReorderDialogProps> = ({
  activeReorderSize,
  activeReorderCategory,
  closeReorderDialog,
  groupsBySizeAndCategory,
  updateGroupOrder,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  draggingSize,
  draggingCategory
}) => {
  const positionInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  
  const isOpen = activeReorderSize !== null && activeReorderCategory !== null;
  
  const sizeLabel = activeReorderSize === 'three' ? 'Dreier' : 'Vierer';
  
  const getCategoryLabel = () => {
    if (!activeReorderCategory) return '';
    return getCategoryDisplay(activeReorderCategory);
  };

  const groupsList = isOpen && activeReorderSize && activeReorderCategory 
    ? groupsBySizeAndCategory[activeReorderSize][activeReorderCategory] || []
    : [];

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog open with:", { 
        activeReorderSize, 
        activeReorderCategory,
        groupCount: groupsList.length,
        groups: groupsList
      });
    }
  }, [isOpen, activeReorderSize, activeReorderCategory, groupsList]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && closeReorderDialog()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Reihenfolge anpassen - {getCategoryLabel()} {sizeLabel}gruppen
          </DialogTitle>
          <DialogDescription>
            Gruppen per Drag & Drop oder durch Eingabe einer Positionsnummer neu anordnen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto py-2">
          {groupsList.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Keine Gruppen vorhanden für diese Kategorie.
            </div>
          ) : (
            groupsList.map((group, index) => (
              <div 
                key={group.id}
                draggable
                onDragStart={e => handleDragStart(e, index, activeReorderSize!, activeReorderCategory!)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, index, activeReorderSize!, activeReorderCategory!)}
                className={`flex items-center justify-between p-3 rounded-md border 
                  ${(draggingSize === activeReorderSize && draggingCategory === activeReorderCategory) 
                    ? 'cursor-grab' : ''} hover:bg-accent/50`}
              >
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span>{group.name}</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={groupsList.length}
                    defaultValue={index + 1}
                    className="w-16 h-8 text-center border rounded-md"
                    ref={(el) => {
                      if (el) positionInputRefs.current.set(group.id, el);
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && activeReorderSize && activeReorderCategory) {
                        updateGroupOrder(activeReorderSize, activeReorderCategory, group.id, val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && activeReorderSize && activeReorderCategory) {
                          updateGroupOrder(activeReorderSize, activeReorderCategory, group.id, val);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Fertig</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupReorderDialog;
