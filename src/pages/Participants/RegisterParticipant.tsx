
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
import { mockParticipants } from '../../data/mockData';
import { Checkbox } from '@/components/ui/checkbox';
import { useTournament } from '@/contexts/TournamentContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const RegisterParticipant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTournament } = useTournament();

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

  // Check if a participant with similar details already exists
  const findExistingParticipant = (): Participant | null => {
    if (!participant.firstName || !participant.lastName) return null;
    
    return mockParticipants.find(
      p => p.firstName.toLowerCase() === participant.firstName?.toLowerCase() && 
           p.lastName.toLowerCase() === participant.lastName?.toLowerCase() &&
           p.birthYear === participant.birthYear
    ) || null;
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    const existingParticipant = findExistingParticipant();
    
    if (existingParticipant) {
      // If participant exists but isn't assigned to current tournament, add the tournament reference
      if (existingParticipant.tournamentId !== activeTournament.id) {
        const index = mockParticipants.findIndex(p => p.id === existingParticipant.id);
        if (index !== -1) {
          mockParticipants[index] = {
            ...existingParticipant,
            tournamentId: activeTournament.id
          };
          
          toast({
            title: "Teilnehmer aktualisiert",
            description: `${existingParticipant.firstName} ${existingParticipant.lastName} wurde dem Turnier ${activeTournament.name} hinzugefügt.`
          });
          
          navigate('/participants');
          return;
        }
      } else {
        toast({
          title: "Teilnehmer existiert bereits",
          description: `${existingParticipant.firstName} ${existingParticipant.lastName} ist bereits für dieses Turnier registriert.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Generate a unique ID for new participant
    const newId = Math.max(...mockParticipants.map(p => p.id), 0) + 1;
    
    // Create the new participant with category and tournament reference
    const category = determineCategory(participant.birthYear);
    const newParticipant: Participant = {
      id: newId,
      firstName: participant.firstName,
      lastName: participant.lastName,
      location: participant.location,
      birthYear: participant.birthYear,
      category: category,
      isGroupOnly: participant.isGroupOnly || false,
      tournamentId: activeTournament.id
    };
    
    // Add to mock data
    mockParticipants.push(newParticipant);
    
    toast({
      title: "Teilnehmer registriert",
      description: `${participant.firstName} ${participant.lastName} wurde erfolgreich für ${activeTournament.name} registriert.`
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
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isGroupOnly" 
                checked={participant.isGroupOnly || false}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isGroupOnly">Nur Gruppenteilnahme (keine Einzelwertung)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/participants')}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!activeTournament}>Teilnehmer speichern</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterParticipant;
