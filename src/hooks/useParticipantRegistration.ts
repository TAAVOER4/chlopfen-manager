
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Participant } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { determineCategory } from '@/utils/categoryUtils';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { useQueryClient } from '@tanstack/react-query';

export const useParticipantRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [participant, setParticipant] = useState<Partial<Participant>>({
    firstName: '',
    lastName: '',
    location: '',
    birthYear: new Date().getFullYear() - 15,
    isGroupOnly: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipant(prev => ({
      ...prev,
      [name]: name === 'birthYear' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setParticipant(prev => ({
      ...prev,
      isGroupOnly: checked,
    }));
  };

  const checkParticipantExists = async (): Promise<boolean> => {
    if (!participant.firstName || !participant.lastName || !participant.birthYear) return false;
    
    try {
      console.log("Checking if participant exists...");
      const allParticipants = await DatabaseService.getAllParticipants();
      console.log("Received all participants:", allParticipants.length);
      
      return allParticipants.some(
        p => p.firstName.toLowerCase() === participant.firstName?.toLowerCase() && 
             p.lastName.toLowerCase() === participant.lastName?.toLowerCase() &&
             p.birthYear === participant.birthYear &&
             p.tournamentId === activeTournament?.id
      );
    } catch (error) {
      console.error('Error checking if participant exists:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeTournament) {
      toast({
        title: "Kein aktives Turnier",
        description: "Bitte wählen Sie zuerst ein aktives Turnier aus.",
        variant: "destructive"
      });
      return;
    }
    
    if (!participant.firstName || !participant.lastName || !participant.location || !participant.birthYear) {
      toast({
        title: "Fehlerhafte Eingabe",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if participant already exists
      console.log("Checking if participant exists before creating...");
      const participantExists = await checkParticipantExists();
      
      if (participantExists) {
        toast({
          title: "Teilnehmer existiert bereits",
          description: `${participant.firstName} ${participant.lastName} ist bereits für dieses Turnier registriert.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create the new participant with category and tournament reference
      const category = determineCategory(participant.birthYear);
      const newParticipant: Omit<Participant, 'id'> = {
        firstName: participant.firstName,
        lastName: participant.lastName,
        location: participant.location,
        birthYear: participant.birthYear,
        category: category,
        isGroupOnly: participant.isGroupOnly || false,
        tournamentId: activeTournament.id,
        groupIds: []
      };
      
      console.log("Creating new participant:", newParticipant);
      
      // Save to database
      await DatabaseService.createParticipant(newParticipant);
      console.log("Participant created successfully");
      
      // Immediately invalidate the participants query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      toast({
        title: "Teilnehmer registriert",
        description: `${participant.firstName} ${participant.lastName} wurde erfolgreich für ${activeTournament.name} registriert.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error('Error creating participant:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern der Teilnehmerdaten ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    participant,
    isSubmitting,
    activeTournament,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    navigateBack: () => navigate('/participants')
  };
};
