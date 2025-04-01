
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Search } from 'lucide-react';
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
import { mockJudges } from '@/data/mockData';
import { getTournamentById } from '@/data/mockTournaments';
import { Judge, Tournament } from '@/types';
import { Badge } from '@/components/ui/badge';

const TournamentJudgesPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedJudges, setSelectedJudges] = useState<number[]>([]);

  // Get tournament data
  useEffect(() => {
    if (tournamentId) {
      const tournamentData = getTournamentById(parseInt(tournamentId));
      if (tournamentData) {
        setTournament(tournamentData);
      }
    }
  }, [tournamentId]);

  // Get judges data
  useEffect(() => {
    setJudges(mockJudges);
    // In a real app, you would filter judges based on tournamentId
    if (tournamentId) {
      const tournamentJudges = mockJudges.filter(
        j => j.tournamentIds?.includes(parseInt(tournamentId))
      );
      setSelectedJudges(tournamentJudges.map(j => j.id));
    }
  }, [tournamentId]);

  const filteredJudges = judges.filter(judge => {
    const matchesSearch = 
      judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'assigned') return matchesSearch && selectedJudges.includes(judge.id);
    if (filter === 'unassigned') return matchesSearch && !selectedJudges.includes(judge.id);
    
    return matchesSearch;
  });

  const toggleJudge = (judgeId: number) => {
    setSelectedJudges(prevSelected => {
      if (prevSelected.includes(judgeId)) {
        return prevSelected.filter(id => id !== judgeId);
      } else {
        return [...prevSelected, judgeId];
      }
    });
  };

  const saveAssignments = () => {
    // In a real app, you would send a request to update judge assignments
    toast({
      title: "Richter zugewiesen",
      description: `${selectedJudges.length} Richter wurden dem Turnier zugewiesen.`,
    });
  };

  const assignAll = () => {
    setSelectedJudges(judges.map(j => j.id));
  };

  const unassignAll = () => {
    setSelectedJudges([]);
  };

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
          Richter zuweisen
        </h1>
        <p className="text-muted-foreground">
          {tournament.name} - {tournament.location}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Richterverwaltung</CardTitle>
              <CardDescription>
                Weisen Sie dem Turnier Richter zu oder entfernen Sie diese.
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
                placeholder="Richter suchen..."
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
                <TableHead>Benutzername</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJudges.length > 0 ? (
                filteredJudges.map((judge) => (
                  <TableRow key={judge.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedJudges.includes(judge.id)}
                          onChange={() => toggleJudge(judge.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{judge.name}</TableCell>
                    <TableCell>{judge.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {judge.role === 'admin' ? 'Administrator' : 'Richter'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {selectedJudges.includes(judge.id) ? (
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Keine Richter gefunden.
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

export default TournamentJudgesPage;
