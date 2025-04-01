
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Judge, CriterionKey, GroupCriterionKey } from '@/types';
import JudgeRow from './JudgeRow';

interface JudgeTableProps {
  judges: Judge[];
  editingJudge: Judge | null;
  onEdit: (judge: Judge) => void;
  onSave: () => void;
  onImpersonate: (judgeId: string) => void;
  onDeleteClick: (judge: Judge) => void;
  onJudgeChange: (judge: Judge) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const JudgeTable: React.FC<JudgeTableProps> = ({ 
  judges, 
  editingJudge, 
  onEdit, 
  onSave,
  onImpersonate,
  onDeleteClick,
  onJudgeChange,
  individualCriteria,
  groupCriteria
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Benutzername</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Zugewiesene Kriterien</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {judges.map(judge => (
          <JudgeRow
            key={judge.id}
            judge={judge}
            editingJudge={editingJudge}
            onEdit={onEdit}
            onSave={onSave}
            onImpersonate={onImpersonate}
            onDeleteClick={onDeleteClick}
            onJudgeChange={onJudgeChange}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default JudgeTable;
