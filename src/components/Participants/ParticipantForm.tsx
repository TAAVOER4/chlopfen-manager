
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Participant } from '@/types';
import { determineCategory, getCategoryDisplay } from '@/utils/categoryUtils';

interface ParticipantFormProps {
  participant: Partial<Participant>;
  isSubmitting: boolean;
  activeTournamentName?: string;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participant,
  isSubmitting,
  activeTournamentName,
  onCancel,
  onSubmit,
  onInputChange,
  onCheckboxChange
}) => {
  const determineParticipantCategory = () => {
    if (!participant.birthYear) return null;
    const category = determineCategory(participant.birthYear);
    return getCategoryDisplay(category);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Neuer Teilnehmer</CardTitle>
          <CardDescription>
            Erfassen Sie die Informationen des Teilnehmers für {activeTournamentName || "das aktuelle Turnier"}.
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
                onChange={onInputChange}
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
                value={participant.lastName || ''}
                onChange={onInputChange}
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
                onChange={onInputChange}
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
              value={participant.location || ''}
              onChange={onInputChange}
              placeholder="Wohnort"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isGroupOnly" 
              checked={participant.isGroupOnly || false}
              onCheckedChange={onCheckboxChange}
              disabled={isSubmitting}
            />
            <Label htmlFor="isGroupOnly">Nur Gruppenteilnahme (keine Einzelwertung)</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={!activeTournamentName || isSubmitting}>
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
  );
};

export default ParticipantForm;
