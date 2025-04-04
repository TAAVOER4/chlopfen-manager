
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { UseFormReturn } from "react-hook-form";
import { Participant } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTournament } from '@/contexts/TournamentContext';
import { DatabaseService } from '@/services/DatabaseService';
import GroupInfoForm, { GroupFormValues } from '@/components/Groups/GroupInfoForm';

interface GroupRegistrationFormProps {
  form: UseFormReturn<GroupFormValues>;
  selectedParticipants: Participant[];
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegenerateName: () => void;
  removeParticipant: (participant: Participant) => void;
}

const GroupRegistrationForm: React.FC<GroupRegistrationFormProps> = ({
  form,
  selectedParticipants,
  handleNameChange,
  handleRegenerateName,
  removeParticipant
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const onSubmit = async (data: GroupFormValues) => {
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

    try {
      setIsSubmitting(true);
      
      // Create new group
      const newGroup = {
        name: data.name,
        category: data.category,
        size: data.size,
        participantIds: selectedParticipants.map(p => p.id),
        tournamentId: activeTournament.id
      };
      
      await DatabaseService.createGroup(newGroup);
      
      toast({
        title: "Gruppe erstellt",
        description: `${data.name} wurde erfolgreich für ${activeTournament.name} erstellt.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler beim Erstellen der Gruppe aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <Button type="submit" disabled={!activeTournament || isSubmitting}>
              {isSubmitting ? "Speichern..." : "Gruppe speichern"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default GroupRegistrationForm;
