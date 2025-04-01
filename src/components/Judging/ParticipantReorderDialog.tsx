
import React, { useRef } from 'react';
import { Move } from 'lucide-react';
import { Category, Participant } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ParticipantReorderDialogProps {
  activeReorderCategory: Category | null;
  setActiveReorderCategory: (category: Category | null) => void;
  participantsByCategory: Record<string, Participant[]>;
  updateParticipantOrder: (category: Category, participantId: string, newPosition: number) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number, category: Category) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number, category: Category) => void;
  draggingCategory: Category | null;
}

const ParticipantReorderDialog: React.FC<ParticipantReorderDialogProps> = ({
  activeReorderCategory,
  setActiveReorderCategory,
  participantsByCategory,
  updateParticipantOrder,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  draggingCategory
}) => {
  const positionInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  return (
    <Dialog open={activeReorderCategory !== null} onOpenChange={(open) => !open && setActiveReorderCategory(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Reihenfolge anpassen - {activeReorderCategory ? getCategoryDisplay(activeReorderCategory) : ''}
          </DialogTitle>
          <DialogDescription>
            Teilnehmer per Drag & Drop oder durch Eingabe einer Positionsnummer neu anordnen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto py-2">
          {activeReorderCategory && participantsByCategory[activeReorderCategory]?.map((participant, index) => (
            <div 
              key={participant.id}
              draggable
              onDragStart={e => handleDragStart(e, index, activeReorderCategory)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, index, activeReorderCategory)}
              className={`flex items-center justify-between p-3 rounded-md border ${draggingCategory === activeReorderCategory ? 'cursor-grab' : ''} hover:bg-accent/50`}
            >
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span>{participant.firstName} {participant.lastName}</span>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  max={participantsByCategory[activeReorderCategory].length}
                  defaultValue={index + 1}
                  className="w-16 h-8 text-center border rounded-md"
                  ref={(el) => {
                    if (el) positionInputRefs.current.set(participant.id, el);
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      updateParticipantOrder(activeReorderCategory, participant.id, val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) {
                        updateParticipantOrder(activeReorderCategory, participant.id, val);
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

export default ParticipantReorderDialog;
