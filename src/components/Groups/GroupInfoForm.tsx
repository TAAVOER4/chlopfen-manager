
import React from 'react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { RefreshCw } from 'lucide-react';
import { z } from "zod";
import { Category, GroupSize, Participant } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';

// Schema for group registration form
export const groupSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein" }),
  category: z.enum(['kids', 'juniors', 'active']),
  size: z.enum(['three', 'four']),
});

export type GroupFormValues = z.infer<typeof groupSchema>;

interface GroupInfoFormProps {
  form: UseFormReturn<GroupFormValues>;
  selectedParticipants: Participant[];
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegenerateName: () => void;
  removeParticipant: (participant: Participant) => void;
}

const GroupInfoForm: React.FC<GroupInfoFormProps> = ({
  form,
  selectedParticipants,
  handleNameChange,
  handleRegenerateName,
  removeParticipant
}) => {
  const size = form.watch('size');
  
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Gruppenname</FormLabel>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleRegenerateName}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Auto-generieren
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Name der Gruppe" 
              value={form.watch('name')}
              onChange={handleNameChange} 
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Kategorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kids">{getCategoryDisplay('kids')}</SelectItem>
                    <SelectItem value="juniors">{getCategoryDisplay('juniors')}</SelectItem>
                    <SelectItem value="active">{getCategoryDisplay('active')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gruppengröße</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Größe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="three">Dreiergruppe</SelectItem>
                    <SelectItem value="four">Vierergruppe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SelectedParticipantsList 
          selectedParticipants={selectedParticipants} 
          removeParticipant={removeParticipant}
          size={size as GroupSize}
        />
      </div>
    </>
  );
};

interface SelectedParticipantsListProps {
  selectedParticipants: Participant[];
  removeParticipant: (participant: Participant) => void;
  size: GroupSize;
}

const SelectedParticipantsList: React.FC<SelectedParticipantsListProps> = ({
  selectedParticipants,
  removeParticipant,
  size
}) => {
  return (
    <div>
      <Label>Ausgewählte Teilnehmer ({selectedParticipants.length}/{size === 'three' ? '3' : '4'})</Label>
      <div className="mt-2 space-y-2">
        {selectedParticipants.length > 0 ? (
          selectedParticipants.map((participant) => (
            <SelectedParticipantItem 
              key={participant.id} 
              participant={participant} 
              removeParticipant={removeParticipant} 
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Keine Teilnehmer ausgewählt</p>
        )}
      </div>
    </div>
  );
};

interface SelectedParticipantItemProps {
  participant: Participant;
  removeParticipant: (participant: Participant) => void;
}

const SelectedParticipantItem: React.FC<SelectedParticipantItemProps> = ({
  participant,
  removeParticipant
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
      <div className="flex items-center">
        <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{participant.firstName} {participant.lastName}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => removeParticipant(participant)}
      >
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

// Needed for the icons in the component
import { X, UserRound } from 'lucide-react';

export default GroupInfoForm;
