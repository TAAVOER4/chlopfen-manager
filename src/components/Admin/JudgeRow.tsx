
import React from 'react';
import { Edit, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from "@/components/ui/table";
import { Judge, CriterionKey, GroupCriterionKey } from '@/types';
import JudgeForm from './JudgeForm';
import JudgeDisplay from './JudgeDisplay';

interface JudgeRowProps {
  judge: Judge;
  editingJudge: Judge | null;
  onEdit: (judge: Judge) => void;
  onSave: () => void;
  onImpersonate: (judgeId: number) => void;
  onDeleteClick: (judge: Judge) => void;
  onJudgeChange: (judge: Judge) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const JudgeRow: React.FC<JudgeRowProps> = ({ 
  judge, 
  editingJudge, 
  onEdit, 
  onSave, 
  onImpersonate,
  onDeleteClick,
  onJudgeChange,
  individualCriteria,
  groupCriteria
}) => {
  const isEditing = editingJudge?.id === judge.id;
  
  // Create maps for quick lookup
  const individualCriteriaMap = Object.fromEntries(
    individualCriteria.map(c => [c.value, c.label])
  );
  
  const groupCriteriaMap = Object.fromEntries(
    groupCriteria.map(c => [c.value, c.label])
  );

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <JudgeForm 
            judge={editingJudge}
            onJudgeChange={onJudgeChange}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
          />
        ) : (
          judge.name
        )}
      </TableCell>
      <TableCell>
        {isEditing ? null : judge.username}
      </TableCell>
      <TableCell>
        {isEditing ? null : (judge.role === 'admin' ? 'Administrator' : 'Richter')}
      </TableCell>
      <TableCell>
        {isEditing ? null : (
          <JudgeDisplay 
            judge={judge}
            individualCriteriaMap={individualCriteriaMap}
            groupCriteriaMap={groupCriteriaMap}
          />
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onEdit(judge)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => onImpersonate(judge.id)}
          >
            Als Benutzer anmelden
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDeleteClick(judge)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default JudgeRow;
