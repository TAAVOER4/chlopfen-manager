
import React from 'react';
import { PenLine, Trash2, Calendar, Clock, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScheduleItem } from '@/types';
import { getCategoryDisplay } from '@/utils/categoryUtils';

interface ScheduleTableProps {
  scheduleItems: ScheduleItem[];
  onEditItem: (item: ScheduleItem) => void;
  onDeleteItem: (item: ScheduleItem) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  scheduleItems,
  onEditItem,
  onDeleteItem
}) => {
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'competition': return <Calendar className="h-4 w-4" />;
      case 'ceremony': return <FileText className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getItemTypeDisplay = (type: string) => {
    switch (type) {
      case 'competition': return 'Wettbewerb';
      case 'ceremony': return 'Zeremonie';
      case 'break': return 'Pause';
      default: return 'Sonstiges';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Zeit</TableHead>
          <TableHead>Titel</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduleItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Keine Einträge gefunden. Fügen Sie einen neuen Eintrag hinzu.
            </TableCell>
          </TableRow>
        ) : (
          scheduleItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium whitespace-nowrap">
                  {item.startTime} - {item.endTime}
                </div>
              </TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>
                {item.category ? getCategoryDisplay(item.category) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getItemTypeIcon(item.type)}
                  <span>{getItemTypeDisplay(item.type)}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.description || '-'}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditItem(item)}>
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteItem(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ScheduleTable;
