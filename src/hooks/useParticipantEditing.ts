
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types';
import { determineCategory } from '@/utils/categoryUtils';
import { supabase } from '@/lib/supabase';
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
        const participantId = parseInt(id);
        
        // Direct query to Supabase
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('id', participantId)
          .single();
        
        if (error) {
          console.error('Error loading participant:', error);
          toast({
            title: "Teilnehmer nicht gefunden",
            description: "Der gesuchte Teilnehmer wurde nicht gefunden.",
            variant: "destructive"
          });
          navigate('/participants');
          return;
        }
        
        if (!data) {
          toast({
            title: "Teilnehmer nicht gefunden",
            description: "Der gesuchte Teilnehmer wurde nicht gefunden.",
            variant: "destructive"
          });
          navigate('/participants');
          return;
        }
        
        // Transform database object to frontend model
        const existingParticipant: Participant = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          location: data.location,
          birthYear: data.birth_year,
          category: data.category,
          isGroupOnly: data.is_group_only || false,
          tournamentId: data.tournament_id,
          groupIds: []
        };
        
        // Fetch group associations
        const { data: groupData, error: groupError } = await supabase
          .from('group_participants')
          .select('group_id')
          .eq('participant_id', participantId);
          
        if (!groupError && groupData) {
          existingParticipant.groupIds = groupData.map(item => item.group_id);
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
      
      // Update participant in database directly with Supabase
      const { error } = await supabase
        .from('participants')
        .update({
          first_name: participant.firstName,
          last_name: participant.lastName,
          location: participant.location,
          birth_year: participant.birthYear,
          category: category,
          is_group_only: participant.isGroupOnly || false
        })
        .eq('id', parseInt(id!));
        
      if (error) {
        throw error;
      }
      
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
