import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Judge } from '@/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, MoreHorizontal, Trash, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JudgeRowProps {
  judge: Judge;
  onEdit: (judge: Judge) => void;
  onDelete: (judge: Judge) => void;
  onImpersonate: (userId: string) => void;
  criteriaMap: {
    individual: Record<string, string>;
    group: Record<string, string>;
  };
}

const JudgeRow: React.FC<JudgeRowProps> = ({ 
  judge, 
  onEdit, 
  onDelete, 
  onImpersonate,
  criteriaMap
}) => {
  
  return (
    <TableRow>
      <TableCell className="font-medium">{judge.name}</TableCell>
      <TableCell>{judge.username}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {judge.role === 'admin' ? 'Administrator' : 'Richter'}
        </Badge>
      </TableCell>
      <TableCell>
        {/* Display individual criterion */}
        {judge.assignedCriteria?.individual && (
          <div className="mb-1">
            <Badge variant="secondary" className="mr-1">Einzel</Badge>
            <span className="text-sm">
              {criteriaMap.individual[judge.assignedCriteria.individual]}
            </span>
          </div>
        )}

        {/* Display group criterion */}
        {judge.assignedCriteria?.group && (
          <div>
            <Badge variant="secondary" className="mr-1">Gruppe</Badge>
            <span className="text-sm">
              {criteriaMap.group[judge.assignedCriteria.group]}
            </span>
          </div>
        )}

        {/* If no criteria assigned */}
        {!judge.assignedCriteria?.individual && !judge.assignedCriteria?.group && (
          <span className="text-muted-foreground text-sm">Keine Kriterien zugewiesen</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(judge)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onImpersonate(judge.id)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Als dieser Benutzer anmelden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(judge)}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default JudgeRow;
