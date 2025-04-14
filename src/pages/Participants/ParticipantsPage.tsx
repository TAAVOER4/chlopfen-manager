
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import NoActiveTournamentAlert from '@/components/Participants/NoActiveTournamentAlert';
import DeleteParticipantDialog from '@/components/Participants/DeleteParticipantDialog';
import ParticipantsHeader from '@/components/Participants/ParticipantsHeader';
import ParticipantsFilter from '@/components/Participants/ParticipantsFilter';
import ParticipantsList from '@/components/Participants/ParticipantsList';
import GroupsList from '@/components/Participants/GroupsList';
import { useParticipantsData } from '@/hooks/useParticipantsData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const ParticipantsPage = () => {
  const queryClient = useQueryClient();
  const {
    participants,
    groups,
    tournamentParticipants,
    filteredParticipants,
    activeTournament,
    searchTerm,
    selectedCategory,
    selectedParticipant,
    deleteDialogOpen,
    isLoading,
    error,
    setSearchTerm,
    setSelectedCategory,
    setDeleteDialogOpen,
    handleDeleteClick,
    handleParticipantDeleted,
    getGroupsForParticipant,
    refetchAll
  } = useParticipantsData();
  
  // Force refresh data when component mounts
  useEffect(() => {
    console.log("ParticipantsPage mounted, invalidating queries...");
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
    refetchAll();
  }, [queryClient, refetchAll]);
  
  const handleRefresh = () => {
    console.log("Manual refresh requested");
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
    refetchAll();
    toast({
      title: "Aktualisierung",
      description: "Daten werden neu geladen...",
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-swiss-blue">Teilnehmer</h1>
        <div className="bg-destructive/10 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Fehler beim Laden der Daten</h2>
          <p className="text-muted-foreground">
            Bitte versuchen Sie die Seite neu zu laden oder kontaktieren Sie den Administrator.
          </p>
          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Daten neu laden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ParticipantsHeader activeTournament={activeTournament} />
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>
      
      {!activeTournament && (
        <NoActiveTournamentAlert />
      )}
      
      {activeTournament && (
        <>
          <Tabs defaultValue="participants">
            <TabsList className="mb-4">
              <TabsTrigger value="participants">Einzelteilnehmer</TabsTrigger>
              <TabsTrigger value="groups">Gruppen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="participants">
              <ParticipantsFilter 
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                setSearchTerm={setSearchTerm}
                setSelectedCategory={setSelectedCategory}
              />
              
              <ParticipantsList 
                filteredParticipants={filteredParticipants}
                tournamentParticipants={tournamentParticipants}
                activeTournamentName={activeTournament.name}
                getGroupsForParticipant={getGroupsForParticipant}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            
            <TabsContent value="groups">
              <GroupsList 
                groups={groups}
                activeTournamentId={activeTournament.id}
                activeTournamentName={activeTournament.name}
                participants={participants}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <DeleteParticipantDialog
        participant={selectedParticipant}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleParticipantDeleted}
      />
    </div>
  );
};

export default ParticipantsPage;
