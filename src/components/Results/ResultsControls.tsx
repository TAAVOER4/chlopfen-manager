
import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';

interface ResultsControlsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  selectedView: string;
  onViewChange: (view: string) => void;
  onExportPDF: () => void;
}

const ResultsControls: React.FC<ResultsControlsProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedView,
  onViewChange,
  onExportPDF
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div className="mb-4 sm:mb-0">
        <Tabs
          value={selectedCategory}
          className="w-full"
          onValueChange={(value) => onCategoryChange(value as Category)}
        >
          <TabsList>
            <TabsTrigger value="kids">Kids</TabsTrigger>
            <TabsTrigger value="juniors">Junioren</TabsTrigger>
            <TabsTrigger value="active">Aktive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex gap-4">
        <Select value={selectedView} onValueChange={onViewChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ansicht wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">Listenansicht</SelectItem>
            <SelectItem value="podium">Podium</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={onExportPDF}>
          <FileText className="h-4 w-4" /> 
          PDF
        </Button>
      </div>
    </div>
  );
};

export default ResultsControls;
