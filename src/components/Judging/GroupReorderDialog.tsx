
import React, { useRef } from 'react';
import { Move } from 'lucide-react';
import { Category, Group, GroupSize } from '../../types';
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
  activeReorderCategory: Category | null;
  closeReorderDialog: () => void;
  groupsBySizeAndCategory: Record<GroupSize, Record<Category, Group[]>>;
  updateGroupOrder: (size: GroupSize, category: Category, groupId: number, newPosition: number) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number, size: GroupSize, category: Category) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number, size: GroupSize, category: Category) => void;
  draggingSize: GroupSize | null;
  draggingCategory: Category | null;
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
  
  const sizeLabel = activeReorderSize === 'three' ? 'Dreier' : 'Vierer';
  
  // For combined categories display (Kids/Juniors)
  const getCategoryLabel = () => {
    if (!activeReorderCategory) return '';
    
    if (activeReorderCategory === 'kids' || activeReorderCategory === 'juniors') {
      return activeReorderSize === 'three' ? 'Kids/Junioren' : 'Kids/Junioren';
    } else {
      return getCategoryDisplay(activeReorderCategory);
    }
  };

  return (
    <Dialog 
      open={activeReorderSize !== null && activeReorderCategory !== null} 
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
          {activeReorderSize && activeReorderCategory && 
           groupsBySizeAndCategory[activeReorderSize]?.[activeReorderCategory]?.map((group, index) => (
            <div 
              key={group.id}
              draggable
              onDragStart={e => handleDragStart(e, index, activeReorderSize, activeReorderCategory)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, index, activeReorderSize, activeReorderCategory)}
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
                  max={groupsBySizeAndCategory[activeReorderSize][activeReorderCategory].length}
                  defaultValue={index + 1}
                  className="w-16 h-8 text-center border rounded-md"
                  ref={(el) => {
                    if (el) positionInputRefs.current.set(group.id, el);
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      updateGroupOrder(activeReorderSize, activeReorderCategory, group.id, val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) {
                        updateGroupOrder(activeReorderSize, activeReorderCategory, group.id, val);
                      }
                    }
                  }}
                />
              </div>
            </div>
          ))}
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
