
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

interface FilterControlsProps {
  exportType: string;
  onExportTypeChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onGeneratePDF: () => void;
  showCategorySelect: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  exportType,
  onExportTypeChange,
  category,
  onCategoryChange,
  onGeneratePDF,
  showCategorySelect
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
      
      {showCategorySelect && (
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-2 block">Kategorie</label>
          <Select
            value={category}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kids">Kinder</SelectItem>
              <SelectItem value="juniors">Junioren</SelectItem>
              <SelectItem value="active">Aktive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className={`w-full md:w-${showCategorySelect ? '1/3' : '2/3'} flex items-end`}>
        <Button onClick={onGeneratePDF} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          PDF generieren
        </Button>
      </div>
    </div>
  );
};
