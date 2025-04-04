
import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTournamentParticipants } from '@/hooks/useTournamentParticipants';
import TournamentParticipantsHeader from '@/components/Admin/Tournaments/TournamentParticipantsHeader';
import TournamentParticipantsSearch from '@/components/Admin/Tournaments/TournamentParticipantsSearch';
import TournamentParticipantsTable from '@/components/Admin/Tournaments/TournamentParticipantsTable';
import TournamentParticipantsActions from '@/components/Admin/Tournaments/TournamentParticipantsActions';
import TournamentParticipantsError from '@/components/Admin/Tournaments/TournamentParticipantsError';

const TournamentParticipantsPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  
  const {
    tournament,
    filteredParticipants,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedParticipants,
    toggleParticipant,
    saveAssignments,
    assignAll,
    unassignAll,
    isLoadingParticipants,
    participantsError
  } = useTournamentParticipants(tournamentId);

  // Handle error and loading states
  if (isLoadingParticipants) {
    return <TournamentParticipantsError isLoading={true} />;
  }

  if (participantsError) {
    return <TournamentParticipantsError hasError={true} />;
  }

  if (!tournament) {
    return <TournamentParticipantsError tournamentNotFound={true} />;
  }

  return (
    <div className="animate-fade-in">
      <TournamentParticipantsHeader tournament={tournament} />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Teilnehmerverwaltung</CardTitle>
              <CardDescription>
                Weisen Sie dem Turnier Teilnehmer zu oder entfernen Sie diese.
              </CardDescription>
            </div>
            <TournamentParticipantsActions 
              assignAll={assignAll}
              unassignAll={unassignAll}
              saveAssignments={saveAssignments}
            />
          </div>
        </CardHeader>
        <CardContent>
          <TournamentParticipantsSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filter}
            setFilter={setFilter}
          />

          <TournamentParticipantsTable
            filteredParticipants={filteredParticipants}
            selectedParticipants={selectedParticipants}
            toggleParticipant={toggleParticipant}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentParticipantsPage;
