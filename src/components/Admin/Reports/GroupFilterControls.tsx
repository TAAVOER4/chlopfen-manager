
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GroupSize, GroupCategory } from '@/types';

interface GroupFilterControlsProps {
  selectedSize: GroupSize;
  onSizeChange: (value: GroupSize) => void;
  selectedCategory: GroupCategory;
  onCategoryChange: (value: GroupCategory) => void;
}

export const GroupFilterControls: React.FC<GroupFilterControlsProps> = ({
  selectedSize,
  onSizeChange,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="w-full md:w-2/3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Gruppengrösse</label>
          <RadioGroup 
            value={selectedSize}
            onValueChange={(value) => onSizeChange(value as GroupSize)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="three" id="option-three" />
              <Label htmlFor="option-three">3er Gruppen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="four" id="option-four" />
              <Label htmlFor="option-four">4er Gruppen</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Kategorie</label>
          <RadioGroup 
            value={selectedCategory}
            onValueChange={(value) => onCategoryChange(value as GroupCategory)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kids_juniors" id="option-kids_juniors" />
              <Label htmlFor="option-kids_juniors">Kids/Junioren</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="option-active" />
              <Label htmlFor="option-active">Aktive</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
