
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantForm } from '@/components/Participants/ParticipantForm';
import { Spinner } from '@/components/ui/spinner';
import { useParticipantEditing } from '@/hooks/useParticipantEditing';
import { useTournament } from '@/contexts/TournamentContext';

const EditParticipant = () => {
  const {
    participant,
    isLoading,
    isSaving,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    navigateBack
  } = useParticipantEditing();
  
  const { activeTournament } = useTournament();

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
        <Button variant="ghost" onClick={navigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer bearbeiten</h1>
      </div>

      <ParticipantForm
        participant={participant}
        isSubmitting={isSaving}
        activeTournamentName={activeTournament?.name}
        onCancel={navigateBack}
        onSubmit={handleSubmit}
        onInputChange={handleChange}
        onCheckboxChange={handleCheckboxChange}
        submitButtonText="Änderungen speichern"
        title="Teilnehmer bearbeiten"
        description="Bearbeiten Sie die Informationen des Teilnehmers. Die Kategorie wird automatisch basierend auf dem Jahrgang bestimmt."
      />
    </div>
  );
};

export default EditParticipant;
