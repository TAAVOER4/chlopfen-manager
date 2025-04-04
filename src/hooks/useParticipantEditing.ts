
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types';
import { determineCategory } from '@/utils/categoryUtils';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';

export const useParticipantEditing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();
  
  const [participant, setParticipant] = useState<Partial<Participant>>({
    firstName: '',
    lastName: '',
    location: '',
    birthYear: new Date().getFullYear() - 15,
    isGroupOnly: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadParticipant = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Fetch all participants and find the one with the matching id
        const allParticipants = await DatabaseService.getAllParticipants();
        const participantId = parseInt(id);
        const existingParticipant = allParticipants.find(p => p.id === participantId);
        
        if (!existingParticipant) {
          toast({
            title: "Teilnehmer nicht gefunden",
            description: "Der gesuchte Teilnehmer wurde nicht gefunden.",
            variant: "destructive"
          });
          navigate('/participants');
          return;
        }
        
        setParticipant(existingParticipant);
      } catch (error) {
        console.error('Error loading participant:', error);
        toast({
          title: "Fehler",
          description: "Beim Laden des Teilnehmers ist ein Fehler aufgetreten.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadParticipant();
  }, [id, navigate, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participant.firstName || !participant.lastName || !participant.location || !participant.birthYear) {
      toast({
        title: "Fehlerhafte Eingabe",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }
    
    // Update category based on birthYear
    const category = determineCategory(participant.birthYear);
    
    try {
      setIsSaving(true);
      
      // Update participant in database
      const updatedParticipant: Participant = {
        id: parseInt(id!),
        firstName: participant.firstName as string,
        lastName: participant.lastName as string,
        location: participant.location as string,
        birthYear: participant.birthYear as number,
        category: category,
        isGroupOnly: participant.isGroupOnly || false,
        tournamentId: participant.tournamentId,
        groupIds: participant.groupIds || []
      };
      
      await DatabaseService.updateParticipant(updatedParticipant);
      
      toast({
        title: "Teilnehmer aktualisiert",
        description: `Die Daten von ${participant.firstName} ${participant.lastName} wurden aktualisiert.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "Fehler bei der Aktualisierung",
        description: "Der Teilnehmer konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    participant,
    isLoading,
    isSaving,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    navigateBack: () => navigate('/participants')
  };
};
