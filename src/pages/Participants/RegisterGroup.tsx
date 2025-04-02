
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockGroups, mockParticipants } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { GroupSize, GroupCategory } from '../../types';
import { isDuplicateGroup } from '../../utils/groupUtils';
import { useGroupForm } from '@/hooks/useGroupForm';
import { useTournament } from '@/contexts/TournamentContext';
import GroupInfoForm, { groupSchema, GroupFormValues } from '@/components/Groups/GroupInfoForm';
import AvailableParticipants from '@/components/Groups/AvailableParticipants';

const RegisterGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();

  // Initialize form with default values - Updated default category to kids_juniors
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids_juniors",
      size: "three",
    },
  });

  // Use our custom hook for form logic
  const {
    selectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName
  } = useGroupForm({ 
    form, 
    mockParticipants: activeTournament 
      ? mockParticipants.filter(p => p.tournamentId === activeTournament.id || p.tournamentId === undefined) 
      : mockParticipants 
  });

  // Handle form submission
  const onSubmit = (data: GroupFormValues) => {
    if (!activeTournament) {
      toast({
        title: "Kein aktives Turnier",
        description: "Bitte wählen Sie zuerst ein aktives Turnier aus.",
        variant: "destructive"
      });
      return;
    }

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

    // Check if a duplicate group already exists
    const participantIds = selectedParticipants.map(p => p.id);
    if (isDuplicateGroup(participantIds)) {
      toast({
        title: "Doppelte Gruppe",
        description: "Es existiert bereits eine Gruppe mit genau diesen Teilnehmern.",
        variant: "destructive"
      });
      return;
    }

    // Create a new group ID
    const newId = Math.max(...mockGroups.map(g => g.id), 0) + 1;
    
    // Create the new group with tournament reference
    const newGroup = {
      id: newId,
      name: data.name,
      size: data.size as GroupSize,
      category: data.category as GroupCategory,
      participantIds: participantIds,
      tournamentId: activeTournament.id
    };
    
    // Update participants to be part of this group
    selectedParticipants.forEach(participant => {
      const index = mockParticipants.findIndex(p => p.id === participant.id);
      if (index !== -1) {
        // Initialize groupIds array if it doesn't exist
        if (!mockParticipants[index].groupIds) {
          mockParticipants[index].groupIds = [];
        }
        // Add the new group id to the participant's groupIds array
        mockParticipants[index].groupIds?.push(newId);
        
        // Ensure the participant is assigned to the active tournament
        if (!mockParticipants[index].tournamentId) {
          mockParticipants[index].tournamentId = activeTournament.id;
        }
      }
    });
    
    // Add the new group to mockGroups
    mockGroups.push(newGroup);
    
    toast({
      title: "Gruppe erstellt",
      description: `${data.name} wurde erfolgreich für ${activeTournament.name} erstellt.`
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

      {!activeTournament && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kein aktives Turnier</AlertTitle>
          <AlertDescription>
            Bitte wählen Sie unter Administration → Turnierverwaltung ein aktives Turnier aus, bevor Sie Gruppen erfassen.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Gruppeninformationen</CardTitle>
                <CardDescription>
                  Erfassen Sie die grundlegenden Informationen der Gruppe für {activeTournament?.name || "das aktuelle Turnier"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupInfoForm 
                  form={form}
                  selectedParticipants={selectedParticipants}
                  handleNameChange={handleNameChange}
                  handleRegenerateName={handleRegenerateName}
                  removeParticipant={removeParticipant}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate('/participants')}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={!activeTournament}>Gruppe speichern</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <AvailableParticipants 
          availableParticipants={availableParticipants}
          selectedCategory={selectedCategory}
          addParticipant={addParticipant}
          mockGroups={mockGroups}
          selectedParticipants={selectedParticipants}
        />
      </div>
    </div>
  );
};

export default RegisterGroup;
