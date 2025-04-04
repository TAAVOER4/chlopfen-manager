
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { determineCategory, getCategoryDisplay } from '../../utils/categoryUtils';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '../../types';
import { DatabaseService } from '@/services/DatabaseService';
import { Spinner } from '@/components/ui/spinner';
import { useTournament } from '@/contexts/TournamentContext';

const EditParticipant = () => {
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

  const determineParticipantCategory = () => {
    if (!participant.birthYear) return null;
    const category = determineCategory(participant.birthYear);
    return getCategoryDisplay(category);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer bearbeiten</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Teilnehmer bearbeiten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Informationen des Teilnehmers.
              Die Kategorie wird automatisch basierend auf dem Jahrgang bestimmt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={participant.firstName || ''}
                  onChange={handleChange}
                  placeholder="Vorname"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={participant.lastName || ''}
                  onChange={handleChange}
                  placeholder="Nachname"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthYear">Jahrgang</Label>
                <Input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  value={participant.birthYear || ''}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center">
                  {determineParticipantCategory() || 'Wird anhand des Jahrgangs bestimmt'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Wohnort</Label>
              <Input
                id="location"
                name="location"
                value={participant.location || ''}
                onChange={handleChange}
                placeholder="Wohnort"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isGroupOnly" 
                checked={participant.isGroupOnly || false}
                onCheckedChange={handleCheckboxChange}
                disabled={isSaving}
              />
              <Label htmlFor="isGroupOnly">Nur Gruppenteilnahme (keine Einzelwertung)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/participants')} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Speichern...
                </>
              ) : (
                'Änderungen speichern'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditParticipant;
