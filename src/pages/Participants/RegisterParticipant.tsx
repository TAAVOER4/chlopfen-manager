
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

const RegisterParticipant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [participant, setParticipant] = useState<Partial<Participant>>({
    firstName: '',
    lastName: '',
    location: '',
    birthYear: new Date().getFullYear() - 15,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipant(prev => ({
      ...prev,
      [name]: name === 'birthYear' ? parseInt(value) || 0 : value,
    }));
  };

  const determineParticipantCategory = () => {
    if (!participant.birthYear) return null;
    const category = determineCategory(participant.birthYear);
    return getCategoryDisplay(category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participant.firstName || !participant.lastName || !participant.location || !participant.birthYear) {
      toast({
        title: "Fehlerhafte Eingabe",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to the database
    toast({
      title: "Teilnehmer registriert",
      description: `${participant.firstName} ${participant.lastName} wurde erfolgreich registriert.`
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

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Neuer Teilnehmer</CardTitle>
            <CardDescription>
              Erfassen Sie die Informationen des Teilnehmers.
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/participants')}>
              Abbrechen
            </Button>
            <Button type="submit">Teilnehmer speichern</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterParticipant;
