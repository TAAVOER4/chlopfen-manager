
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GroupFilterControls } from './GroupFilterControls';
import { GroupSize, GroupCategory } from '@/types';

interface GroupFilterPanelProps {
  exportType: string;
  onExportTypeChange: (value: string) => void;
  groupSize: GroupSize;
  onGroupSizeChange: (value: GroupSize) => void;
  groupCategory: GroupCategory;
  onGroupCategoryChange: (value: GroupCategory) => void;
  onGeneratePDF: () => void;
}

export const GroupFilterPanel: React.FC<GroupFilterPanelProps> = ({
  exportType,
  onExportTypeChange,
  groupSize,
  onGroupSizeChange,
  groupCategory,
  onGroupCategoryChange,
  onGeneratePDF
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <label className="text-sm font-medium mb-2 block">Export-Typ</label>
        <Select
          value={exportType}
          onValueChange={onExportTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Export-Typ wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Einzelwertung</SelectItem>
            <SelectItem value="group">Gruppenwertung</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <GroupFilterControls
        selectedSize={groupSize}
        onSizeChange={onGroupSizeChange}
        selectedCategory={groupCategory}
        onCategoryChange={onGroupCategoryChange}
      />
      
      <div className="w-full md:w-1/3 flex items-end">
        <Button onClick={onGeneratePDF} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          PDF generieren
        </Button>
      </div>
    </div>
  );
};
