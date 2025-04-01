
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, UserRound } from 'lucide-react';
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockGroups, mockParticipants } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Participant, Category, GroupSize } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';

// Schema for group registration form
const groupSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein" }),
  category: z.enum(['kids', 'juniors', 'active']),
  size: z.enum(['three', 'four']),
});

type GroupFormValues = z.infer<typeof groupSchema>;

const RegisterGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('kids');

  // Initialize form with default values
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids",
      size: "three",
    },
  });

  // Get the current values from the form
  const { category, size } = form.watch();

  // Update available participants when category changes
  useEffect(() => {
    setSelectedCategory(category as Category);
    setSelectedParticipants([]); // Clear selected participants when category changes
    
    // Filter participants by category and those not already in a group
    const filtered = mockParticipants.filter(
      (p) => p.category === category && !p.group
    );
    setAvailableParticipants(filtered);
  }, [category]);

  // Handle adding a participant to the group
  const addParticipant = (participant: Participant) => {
    // Check if we've reached the maximum number of participants for the selected size
    const maxParticipants = size === 'three' ? 3 : 4;
    if (selectedParticipants.length >= maxParticipants) {
      toast({
        title: "Maximale Anzahl erreicht",
        description: `Eine ${size === 'three' ? 'Dreier' : 'Vierer'}gruppe kann maximal ${maxParticipants} Teilnehmer haben.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedParticipants([...selectedParticipants, participant]);
    setAvailableParticipants(availableParticipants.filter(p => p.id !== participant.id));
  };

  // Handle removing a participant from the group
  const removeParticipant = (participant: Participant) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
    setAvailableParticipants([...availableParticipants, participant]);
  };

  // Handle form submission
  const onSubmit = (data: GroupFormValues) => {
    if (selectedParticipants.length === 0) {
      toast({
        title: "Keine Teilnehmer ausgewählt",
        description: "Bitte wählen Sie mindestens einen Teilnehmer aus.",
        variant: "destructive"
      });
      return;
    }

    // Check if we have the right number of participants for the selected size
    const requiredParticipants = data.size === 'three' ? 3 : 4;
    if (selectedParticipants.length !== requiredParticipants) {
      toast({
        title: "Falsche Anzahl an Teilnehmern",
        description: `Eine ${data.size === 'three' ? 'Dreier' : 'Vierer'}gruppe muss genau ${requiredParticipants} Teilnehmer haben.`,
        variant: "destructive"
      });
      return;
    }

    // Create a new group ID
    const newId = `g${mockGroups.length + 1}`;
    
    // Create the new group
    const newGroup = {
      id: newId,
      name: data.name,
      size: data.size as GroupSize,
      category: data.category as Category,
      participantIds: selectedParticipants.map(p => p.id)
    };
    
    // Update participants to be part of this group
    selectedParticipants.forEach(participant => {
      const index = mockParticipants.findIndex(p => p.id === participant.id);
      if (index !== -1) {
        mockParticipants[index].group = newId;
        mockParticipants[index].groupSize = data.size as GroupSize;
      }
    });
    
    // Add the new group to mockGroups
    mockGroups.push(newGroup);
    
    toast({
      title: "Gruppe erstellt",
      description: `${data.name} wurde erfolgreich erstellt.`
    });
    
    navigate('/participants');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Gruppe erfassen</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Gruppeninformationen</CardTitle>
                <CardDescription>
                  Erfassen Sie die grundlegenden Informationen der Gruppe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gruppenname</FormLabel>
                      <FormControl>
                        <Input placeholder="Name der Gruppe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <div>
                  <Label>Ausgewählte Teilnehmer ({selectedParticipants.length}/{size === 'three' ? '3' : '4'})</Label>
                  <div className="mt-2 space-y-2">
                    {selectedParticipants.length > 0 ? (
                      selectedParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
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
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Keine Teilnehmer ausgewählt</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate('/participants')}>
                  Abbrechen
                </Button>
                <Button type="submit">Gruppe speichern</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Teilnehmer</CardTitle>
            <CardDescription>
              Wählen Sie Teilnehmer für die Gruppe aus
              {selectedCategory && ` (${getCategoryDisplay(selectedCategory)})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableParticipants.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {availableParticipants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                    onClick={() => addParticipant(participant)}
                  >
                    <div>
                      <div className="font-medium">{participant.firstName} {participant.lastName}</div>
                      <div className="text-sm text-muted-foreground">{participant.location}, {participant.birthYear}</div>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {selectedCategory ? 
                    `Keine verfügbaren Teilnehmer in der Kategorie ${getCategoryDisplay(selectedCategory)}` : 
                    'Keine verfügbaren Teilnehmer'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterGroup;
