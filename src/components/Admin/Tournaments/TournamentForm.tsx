
import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tournament } from '@/types';

export const tournamentSchema = z.object({
  name: z.string().min(3, { message: 'Der Turniername muss mindestens 3 Zeichen lang sein.' }),
  date: z.date({ required_error: 'Bitte wählen Sie ein Datum aus.' }),
  location: z.string().min(3, { message: 'Der Durchführungsort muss angegeben werden.' }),
  year: z.number().int().min(2000).max(2100),
  isActive: z.boolean().default(false),
});

export type TournamentFormValues = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  onSubmit: (values: TournamentFormValues) => void;
  isEditing: boolean;
  defaultValues?: TournamentFormValues;
}

const TournamentForm: React.FC<TournamentFormProps> = ({
  onSubmit,
  isEditing,
  defaultValues = {
    name: '',
    date: new Date(),
    location: '',
    year: new Date().getFullYear(),
    isActive: false,
  },
}) => {
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turniername</FormLabel>
              <FormControl>
                <Input placeholder="Turnierbezeichnung" {...field} />
              </FormControl>
              <FormDescription>
                Der offizielle Name des Turniers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Turnierdatum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Das Datum, an dem das Turnier stattfindet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durchführungsort</FormLabel>
              <FormControl>
                <Input placeholder="Ort des Turniers" {...field} />
              </FormControl>
              <FormDescription>
                Die genaue Angabe des Veranstaltungsortes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jahr</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Jahr des Turniers" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                />
              </FormControl>
              <FormDescription>
                Das Kalenderjahr des Turniers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Als aktives Turnier festlegen
                </FormLabel>
                <FormDescription>
                  Wenn aktiviert, wird dieses Turnier als das aktuell aktive Turnier verwendet.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">{isEditing ? 'Aktualisieren' : 'Erstellen'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default TournamentForm;
