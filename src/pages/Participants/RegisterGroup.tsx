
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockParticipants } from '../../data/mockData';
import { useTournament } from '@/contexts/TournamentContext';
import GroupInfoForm, { groupSchema, GroupFormValues } from '@/components/Groups/GroupInfoForm';
import { useGroupForm } from '@/hooks/useGroupForm';
import AvailableParticipants from '@/components/Groups/AvailableParticipants';
import GroupRegistrationForm from '@/components/Groups/GroupRegistrationForm';

const RegisterGroup = () => {
  const navigate = useNavigate();
  const { activeTournament } = useTournament();

  // Initialize form with default values
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids_juniors",
      size: "three",
    },
  });

  // Use our custom hook for form logic
  const {
    selectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName
  } = useGroupForm({ 
    form, 
    mockParticipants: activeTournament 
      ? mockParticipants.filter(p => p.tournamentId === activeTournament.id || p.tournamentId === undefined) 
      : mockParticipants 
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue">Gruppe erfassen</h1>
      </div>

      {!activeTournament && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kein aktives Turnier</AlertTitle>
          <AlertDescription>
            Bitte wählen Sie unter Administration → Turnierverwaltung ein aktives Turnier aus, bevor Sie Gruppen erfassen.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupRegistrationForm />

        <AvailableParticipants 
          availableParticipants={availableParticipants}
          selectedCategory={selectedCategory}
          addParticipant={addParticipant}
          mockGroups={[]}
          selectedParticipants={selectedParticipants}
        />
      </div>
    </div>
  );
};

export default RegisterGroup;
