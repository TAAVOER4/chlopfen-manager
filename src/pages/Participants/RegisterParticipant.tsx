
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoActiveTournamentAlert from '@/components/Participants/NoActiveTournamentAlert';
import ParticipantForm from '@/components/Participants/ParticipantForm';
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
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer erfassen</h1>
      </div>

      {!activeTournament && <NoActiveTournamentAlert />}

      <ParticipantForm 
        participant={participant}
        isSubmitting={isSubmitting}
        activeTournamentName={activeTournament?.name}
        onCancel={navigateBack}
        onSubmit={handleSubmit}
        onInputChange={handleChange}
        onCheckboxChange={handleCheckboxChange}
      />
    </div>
  );
};

export default RegisterParticipant;
