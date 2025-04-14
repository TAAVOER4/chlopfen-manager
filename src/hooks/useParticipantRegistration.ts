
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Participant } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { determineCategory } from '@/utils/categoryUtils';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
      
      // Direct Supabase query to check if participant exists
      const { data, error } = await supabase
        .from('participants')
        .select('id')
        .eq('first_name', participant.firstName)
        .eq('last_name', participant.lastName)
        .eq('birth_year', participant.birthYear)
        .eq('tournament_id', activeTournament?.id);
      
      if (error) {
        console.error('Error checking if participant exists:', error);
        return false;
      }
      
      console.log("Participant exists check result:", data);
      return data && data.length > 0;
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
      
      // Direct Supabase insert
      const { data, error } = await supabase
        .from('participants')
        .insert([{
          first_name: newParticipant.firstName,
          last_name: newParticipant.lastName,
          location: newParticipant.location,
          birth_year: newParticipant.birthYear,
          category: newParticipant.category,
          is_group_only: newParticipant.isGroupOnly || false,
          tournament_id: newParticipant.tournamentId
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from participant creation');
      }
      
      console.log("Participant created successfully:", data);
      
      // Immediately invalidate the participants query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      // Show both toast types for better visibility
      toast({
        title: "Teilnehmer registriert",
        description: `${participant.firstName} ${participant.lastName} wurde erfolgreich für ${activeTournament.name} registriert.`
      });
      
      sonnerToast.success(`${participant.firstName} ${participant.lastName} wurde erfolgreich registriert.`);
      
      navigate('/participants');
    } catch (error) {
      console.error('Error creating participant:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern der Teilnehmerdaten ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      
      sonnerToast.error("Fehler beim Speichern der Teilnehmerdaten");
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
