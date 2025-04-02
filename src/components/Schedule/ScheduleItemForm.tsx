
import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Category, GroupCategory, AllCategory, ScheduleItem } from '@/types';
import { getCategoryDisplay } from '@/utils/categoryUtils';

interface ScheduleItemFormProps {
  formData: Partial<ScheduleItem>;
  currentItem: ScheduleItem | null;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ScheduleItemForm: React.FC<ScheduleItemFormProps> = ({
  formData,
  currentItem,
  handleFormChange,
  handleSelectChange,
  handleSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Startzeit *</Label>
          <Input 
            id="startTime" 
            name="startTime" 
            type="time"
            value={formData.startTime} 
            onChange={handleFormChange} 
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">Endzeit *</Label>
          <Input 
            id="endTime" 
            name="endTime" 
            type="time"
            value={formData.endTime} 
            onChange={handleFormChange} 
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Titel *</Label>
        <Input 
          id="title" 
          name="title" 
          value={formData.title} 
          onChange={handleFormChange} 
          placeholder="Z.B. Kids Einzelwettbewerb" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Typ *</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => handleSelectChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie einen Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="competition">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Wettbewerb</span>
              </div>
            </SelectItem>
            <SelectItem value="ceremony">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Zeremonie</span>
              </div>
            </SelectItem>
            <SelectItem value="break">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Pause</span>
              </div>
            </SelectItem>
            <SelectItem value="other">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Sonstiges</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {formData.type === 'competition' && (
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select 
            value={formData.category as string} 
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie eine Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="juniors">Junioren</SelectItem>
              <SelectItem value="active">Aktive</SelectItem>
              <SelectItem value="kids_juniors">Kids/Junioren</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description || ''} 
          onChange={handleFormChange} 
          placeholder="Optionale Beschreibung" 
          rows={3}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit">
          {currentItem ? 'Speichern' : 'Hinzufügen'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ScheduleItemForm;
