
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Group, Participant } from '@/types';
import { useTournament } from '@/contexts/TournamentContext';
import { Spinner } from '@/components/ui/spinner';
import NoActiveTournamentAlert from '@/components/Participants/NoActiveTournamentAlert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import DeleteParticipantDialog from '@/components/Participants/DeleteParticipantDialog';

const ParticipantsPage = () => {
  const navigate = useNavigate();
  const { activeTournament } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants', activeTournament?.id],
    queryFn: DatabaseService.getAllParticipants,
    staleTime: 0, // Set to 0 to always fetch fresh data
  });
  
  // Fetch groups from the database
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups,
    error: groupsError 
  } = useQuery({
    queryKey: ['groups', activeTournament?.id],
    queryFn: DatabaseService.getAllGroups,
    staleTime: 0, // Set to 0 to always fetch fresh data
  });
  
  // Filter participants by tournament
  const tournamentParticipants = activeTournament 
    ? participants.filter(p => p.tournamentId === activeTournament.id)
    : [];
  
  // Filter participants based on search term and category
  const filteredParticipants = tournamentParticipants.filter(participant => {
    const matchesSearch = 
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      (selectedCategory === 'groupOnly' && participant.isGroupOnly) || 
      participant.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleEditParticipant = (participantId: number) => {
    navigate(`/participants/edit/${participantId}`);
  };
  
  const handleDeleteClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };
  
  const handleParticipantDeleted = () => {
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  };
  
  const getGroupsForParticipant = (participantId: number): Group[] => {
    if (!groups) return [];
    return groups.filter(group => 
      group.participantIds.includes(participantId) && 
      group.tournamentId === activeTournament?.id
    );
  };
  
  // Loading state
  if (isLoadingParticipants || isLoadingGroups) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
      </div>
    );
  }
  
  // Error state
  if (participantsError || groupsError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-swiss-blue">Teilnehmer</h1>
        <div className="bg-destructive/10 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Fehler beim Laden der Daten</h2>
          <p className="text-muted-foreground">
            Bitte versuchen Sie die Seite neu zu laden oder kontaktieren Sie den Administrator.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={() => navigate('/participants/register')}
            disabled={!activeTournament}
          >
            <Plus className="h-4 w-4 mr-2" />
            Teilnehmer erfassen
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/participants/register-group')}
            disabled={!activeTournament}
          >
            <Plus className="h-4 w-4 mr-2" />
            Gruppe erfassen
          </Button>
        </div>
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
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Teilnehmer suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Alle
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'kids' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('kids')}
                  >
                    Kinder
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'juniors' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('juniors')}
                  >
                    Junioren
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'active' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('active')}
                  >
                    Aktive
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'groupOnly' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('groupOnly')}
                  >
                    Nur Gruppe
                  </Badge>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Jahrgang</TableHead>
                      <TableHead>Wohnort</TableHead>
                      <TableHead>Gruppe(n)</TableHead>
                      <TableHead>Teilnahme</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((participant) => {
                        const participantGroups = getGroupsForParticipant(participant.id);
                        return (
                          <TableRow key={participant.id}>
                            <TableCell className="font-medium">
                              {participant.firstName} {participant.lastName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {participant.category === 'kids' ? 'Kinder' : 
                                participant.category === 'juniors' ? 'Junioren' : 'Aktive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{participant.birthYear}</TableCell>
                            <TableCell>{participant.location}</TableCell>
                            <TableCell>
                              {participantGroups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {participantGroups.map(group => (
                                    <Badge 
                                      key={group.id} 
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {group.name}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {participant.isGroupOnly ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Nur Gruppe
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Einzel & Gruppe
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditParticipant(participant.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteClick(participant)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {tournamentParticipants.length === 0 
                            ? `Keine Teilnehmer für ${activeTournament.name} gefunden.` 
                            : 'Keine Teilnehmer gefunden, die Ihren Suchkriterien entsprechen.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {tournamentParticipants.length > 0 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {tournamentParticipants.length} Teilnehmer insgesamt für {activeTournament.name}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="groups">
              <div className="bg-white rounded-lg border p-8 min-h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold mb-4">Gruppenübersicht</h3>
                {groups.filter(g => g.tournamentId === activeTournament.id).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {groups
                      .filter(g => g.tournamentId === activeTournament.id)
                      .map(group => (
                        <div 
                          key={group.id} 
                          className="border rounded-md p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">{group.name}</h4>
                              <Badge variant="outline" className="mt-1">
                                {group.category === 'kids_juniors' ? 'Kinder/Junioren' : 'Aktive'}
                              </Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/participants/edit-group/${group.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground mb-2">
                              {group.participantIds.length} Teilnehmer
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {group.participantIds.slice(0, 3).map(participantId => {
                                const participant = participants.find(p => p.id === participantId);
                                return participant ? (
                                  <Badge key={participantId} variant="secondary" className="text-xs">
                                    {participant.firstName} {participant.lastName}
                                  </Badge>
                                ) : null;
                              })}
                              {group.participantIds.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{group.participantIds.length - 3} weitere
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Keine Gruppen für {activeTournament.name} gefunden.
                    </p>
                    <Button onClick={() => navigate('/participants/register-group')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gruppe erstellen
                    </Button>
                  </div>
                )}
              </div>
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
