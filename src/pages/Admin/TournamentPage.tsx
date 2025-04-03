import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Map, Trophy, Plus, PenLine, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTournament } from '@/contexts/TournamentContext';
import { Tournament } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { TournamentContextType } from '@/contexts/user/types';

const tournamentSchema = z.object({
  name: z.string().min(3, { message: 'Der Turniername muss mindestens 3 Zeichen lang sein.' }),
  date: z.date({ required_error: 'Bitte wählen Sie ein Datum aus.' }),
  location: z.string().min(3, { message: 'Der Durchführungsort muss angegeben werden.' }),
  year: z.number().int().min(2000).max(2100),
  isActive: z.boolean().default(false),
});

type TournamentFormValues = z.infer<typeof tournamentSchema>;

const TournamentPage = () => {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tournaments, activeTournament, setActiveTournament, updateTournament, addTournament } = useTournament();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: '',
      date: new Date(),
      location: '',
      year: new Date().getFullYear(),
      isActive: false,
    },
  });
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
        <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        <Button asChild>
          <a href="/">Zurück zur Startseite</a>
        </Button>
      </div>
    );
  }
  
  const handleEdit = (tournament: Tournament) => {
    setIsEditing(true);
    form.reset({
      name: tournament.name,
      date: new Date(tournament.date),
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.isActive,
    });
    form.setValue('id' as any, tournament.id);
    setDialogOpen(true);
  };
  
  const handleAdd = () => {
    setIsEditing(false);
    form.reset({
      name: '',
      date: new Date(),
      location: '',
      year: new Date().getFullYear(),
      isActive: false,
    });
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = () => {
    if (!tournamentToDelete) return;
    
    toast({
      title: "Turnier gelöscht",
      description: `Das Turnier "${tournamentToDelete.name}" wurde erfolgreich gelöscht.`,
    });
    
    setDeleteConfirmOpen(false);
    setTournamentToDelete(null);
  };
  
  const handleSetActive = (tournament: Tournament) => {
    setActiveTournament({
      ...tournament,
      isActive: true,
    });
    
    toast({
      title: "Aktives Turnier festgelegt",
      description: `"${tournament.name}" ist jetzt das aktive Turnier.`,
    });
  };
  
  const onSubmit = (values: TournamentFormValues) => {
    if (isEditing) {
      const id = form.getValues('id' as any);
      
      const updatedTournament: Tournament = {
        id,
        name: values.name,
        date: format(values.date, 'yyyy-MM-dd'),
        location: values.location,
        year: values.year,
        isActive: values.isActive
      };
      
      updateTournament(updatedTournament);
      
      toast({
        title: "Turnier aktualisiert",
        description: `Das Turnier "${values.name}" wurde erfolgreich aktualisiert.`,
      });
    } else {
      const newTournament: Tournament = {
        id: Math.max(0, ...tournaments.map(t => t.id)) + 1,
        name: values.name,
        date: format(values.date, 'yyyy-MM-dd'),
        location: values.location,
        year: values.year,
        isActive: values.isActive
      };
      
      addTournament(newTournament);
      
      toast({
        title: "Turnier erstellt",
        description: `Das Turnier "${values.name}" wurde erfolgreich erstellt.`,
      });
    }
    
    setDialogOpen(false);
  };
  
  const goToParticipantAssignment = (tournamentId: number) => {
    navigate(`/admin/tournament/${tournamentId}/participants`);
  };
  
  const goToJudgeAssignment = (tournamentId: number) => {
    navigate(`/admin/tournament/${tournamentId}/judges`);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Turniereinstellungen</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Neues Turnier
        </Button>
      </div>
      
      {activeTournament && (
        <Card className="mb-8 border-swiss-blue/50">
          <CardHeader className="bg-swiss-blue/5">
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-swiss-blue" />
              Aktives Turnier
            </CardTitle>
            <CardDescription>
              Das aktuell aktive Turnier für alle Funktionen
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{activeTournament.name}</h3>
                <p className="text-muted-foreground flex items-center mt-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(activeTournament.date), 'PPP', { locale: de })}
                </p>
                <p className="text-muted-foreground flex items-center mt-1">
                  <Map className="h-4 w-4 mr-2" />
                  {activeTournament.location}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => handleEdit(activeTournament)}>
                  <PenLine className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" onClick={() => goToParticipantAssignment(activeTournament.id)}>
                  Teilnehmer zuweisen
                </Button>
                <Button variant="outline" onClick={() => goToJudgeAssignment(activeTournament.id)}>
                  Richter zuweisen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Alle Turniere</CardTitle>
          <CardDescription>Verwaltung aller Turniere nach Jahr</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Jahr</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>{format(new Date(tournament.date), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>{tournament.location}</TableCell>
                    <TableCell>{tournament.year}</TableCell>
                    <TableCell>
                      {tournament.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inaktiv
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!tournament.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActive(tournament)}
                            className="h-8"
                          >
                            Aktivieren
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tournament)}
                          className="h-8"
                        >
                          <PenLine className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(tournament)}
                          className="h-8"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Turniere vorhanden. Klicken Sie auf "Neues Turnier", um ein Turnier zu erstellen.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Turnier bearbeiten' : 'Neues Turnier erstellen'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Bearbeiten Sie die Turnierdetails unten.' : 'Geben Sie die Turnierdetails unten ein.'}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Turnier löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie dieses Turnier löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {tournamentToDelete && (
              <p className="font-medium">{tournamentToDelete.name}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentPage;
