
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantForm } from '@/components/Participants/ParticipantForm';
import { useParticipantRegistration } from '@/hooks/useParticipantRegistration';

const RegisterParticipant = () => {
  const {
    participant,
    isSubmitting,
    activeTournament,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    navigateBack
  } = useParticipantRegistration();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={navigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Neuer Teilnehmer</h1>
      </div>

      <ParticipantForm
        participant={participant}
        isSubmitting={isSubmitting}
        activeTournamentName={activeTournament?.name}
        onCancel={navigateBack}
        onSubmit={handleSubmit}
        onInputChange={handleChange}
        onCheckboxChange={handleCheckboxChange}
        title="Neuer Teilnehmer"
        description="Erfassen Sie die Informationen des Teilnehmers für {activeTournamentName}. Die Kategorie wird automatisch basierend auf dem Jahrgang bestimmt."
        submitButtonText="Teilnehmer speichern"
      />
    </div>
  );
};

export default RegisterParticipant;
