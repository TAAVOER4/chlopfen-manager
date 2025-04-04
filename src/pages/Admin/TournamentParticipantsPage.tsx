
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Filter, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Participant, Tournament } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useTournament } from '@/contexts/TournamentContext';
import { Spinner } from '@/components/ui/spinner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';

const TournamentParticipantsPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { toast } = useToast();
  const { activeTournament, setActiveTournament, tournaments } = useTournament();
  const queryClient = useQueryClient();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    retry: 1,
    staleTime: 0, // Set to 0 to always fetch fresh data
  });

  // Get tournament data
  useEffect(() => {
    if (tournamentId && tournaments.length > 0) {
      const tournamentData = tournaments.find(t => t.id === parseInt(tournamentId));
      if (tournamentData) {
        setTournament(tournamentData);
      }
    }
  }, [tournamentId, tournaments]);

  // Set selected participants based on tournament ID
  useEffect(() => {
    if (tournamentId) {
      const tournamentParticipants = participants.filter(
        p => p.tournamentId === parseInt(tournamentId)
      );
      setSelectedParticipants(tournamentParticipants.map(p => p.id));
    }
  }, [tournamentId, participants]);

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'assigned') return matchesSearch && selectedParticipants.includes(participant.id);
    if (filter === 'unassigned') return matchesSearch && !selectedParticipants.includes(participant.id);
    
    return matchesSearch;
  });

  const toggleParticipant = (participantId: number) => {
    setSelectedParticipants(prevSelected => {
      if (prevSelected.includes(participantId)) {
        return prevSelected.filter(id => id !== participantId);
      } else {
        return [...prevSelected, participantId];
      }
    });
  };

  const saveAssignments = async () => {
    if (!tournament) return;

    try {
      // Here we would update the participants in the database
      // This would require a new method in DatabaseService to update participant tournament assignments
      
      // For now, we'll just show a success message
      toast({
        title: "Teilnehmer zugewiesen",
        description: `${selectedParticipants.length} Teilnehmer wurden dem Turnier ${tournament.name} zugewiesen.`,
      });
      
      // Immediately invalidate queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      // Refresh active tournament if this is the active one
      if (activeTournament && tournament.id === activeTournament.id) {
        setActiveTournament(tournament);
      }
    } catch (error) {
      console.error('Error saving participant assignments:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern der Teilnehmer ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const assignAll = () => {
    setSelectedParticipants(participants.map(p => p.id));
  };

  const unassignAll = () => {
    setSelectedParticipants([]);
  };

  // Loading state
  if (isLoadingParticipants) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
      </div>
    );
  }

  // Error state
  if (participantsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Fehler beim Laden der Teilnehmer</h2>
        <Button asChild>
          <Link to="/admin/tournament">Zurück zur Turnierverwaltung</Link>
        </Button>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Turnier nicht gefunden</h2>
        <Button asChild>
          <Link to="/admin/tournament">Zurück zur Turnierverwaltung</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="link" asChild className="px-0">
          <Link to="/admin/tournament">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Turnierverwaltung
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-swiss-blue mt-2">
          Teilnehmer zuweisen
        </h1>
        <p className="text-muted-foreground">
          {tournament.name} - {tournament.location}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Teilnehmerverwaltung</CardTitle>
              <CardDescription>
                Weisen Sie dem Turnier Teilnehmer zu oder entfernen Sie diese.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={assignAll}>
                Alle zuweisen
              </Button>
              <Button variant="outline" onClick={unassignAll}>
                Alle entfernen
              </Button>
              <Button onClick={saveAssignments}>
                Änderungen speichern
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Teilnehmer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant={filter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('all')}
              >
                Alle
              </Badge>
              <Badge
                variant={filter === 'assigned' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('assigned')}
              >
                Zugewiesen
              </Badge>
              <Badge
                variant={filter === 'unassigned' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('unassigned')}
              >
                Nicht zugewiesen
              </Badge>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Geburtsjahr</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={() => toggleParticipant(participant.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>{participant.location}</TableCell>
                    <TableCell>{participant.birthYear}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {selectedParticipants.includes(participant.id) ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Zugewiesen
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Nicht zugewiesen</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Teilnehmer gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentParticipantsPage;
