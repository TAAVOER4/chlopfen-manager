
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
  onEdit: (judge: Judge) => void;
  onSave: () => void;
  onImpersonate: (judgeId: string) => void; // Changed from number to string
  onDeleteClick: (judge: Judge) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const JudgeTable: React.FC<JudgeTableProps> = ({ 
  judges, 
  onEdit, 
  onSave,
  onImpersonate,
  onDeleteClick,
  individualCriteria,
  groupCriteria
}) => {
  // Create maps for quick lookup
  const criteriaMap = {
    individual: Object.fromEntries(
      individualCriteria.map(c => [c.value, c.label])
    ),
    group: Object.fromEntries(
      groupCriteria.map(c => [c.value, c.label])
    )
  };

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
            onEdit={onEdit}
            onSave={onSave}
            onImpersonate={onImpersonate}
            onDeleteClick={onDeleteClick}
            criteriaMap={criteriaMap}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default JudgeTable;
