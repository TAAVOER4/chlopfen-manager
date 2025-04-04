
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { determineCategory, getCategoryDisplay } from '../../utils/categoryUtils';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { useTournament } from '@/contexts/TournamentContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DatabaseService } from '@/services/DatabaseService';
import { Spinner } from '@/components/ui/spinner';

const RegisterParticipant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const determineParticipantCategory = () => {
    if (!participant.birthYear) return null;
    const category = determineCategory(participant.birthYear);
    return getCategoryDisplay(category);
  };

  const checkParticipantExists = async (): Promise<boolean> => {
    if (!participant.firstName || !participant.lastName || !participant.birthYear) return false;
    
    try {
      const allParticipants = await DatabaseService.getAllParticipants();
      
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

    // Check if participant already exists
    const participantExists = await checkParticipantExists();
    
    if (participantExists) {
      toast({
        title: "Teilnehmer existiert bereits",
        description: `${participant.firstName} ${participant.lastName} ist bereits für dieses Turnier registriert.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
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
      
      // Save to database
      await DatabaseService.createParticipant(newParticipant);
      
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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer erfassen</h1>
      </div>

      {!activeTournament && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kein aktives Turnier</AlertTitle>
          <AlertDescription>
            Bitte wählen Sie unter Administration → Turnierverwaltung ein aktives Turnier aus, bevor Sie Teilnehmer erfassen.
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Neuer Teilnehmer</CardTitle>
            <CardDescription>
              Erfassen Sie die Informationen des Teilnehmers für {activeTournament?.name || "das aktuelle Turnier"}.
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
                  value={participant.firstName}
                  onChange={handleChange}
                  placeholder="Vorname"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={participant.lastName}
                  onChange={handleChange}
                  placeholder="Nachname"
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                value={participant.location}
                onChange={handleChange}
                placeholder="Wohnort"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isGroupOnly" 
                checked={participant.isGroupOnly || false}
                onCheckedChange={handleCheckboxChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="isGroupOnly">Nur Gruppenteilnahme (keine Einzelwertung)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/participants')} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!activeTournament || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Speichern...
                </>
              ) : (
                'Teilnehmer speichern'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterParticipant;
